// Matrix switch API client with Basic Auth

export interface MatrixStatus {
  outputs: number[]; // Array where index = output number (0-7), value = input number (1-8)
}

export class MatrixApiClient {
  private baseUrl: string;
  private username = 'admin';
  private password = 'admin';

  constructor(deviceIp: string) {
    this.baseUrl = `http://${deviceIp}`;
  }

  private async sendCommand(command: Record<string, unknown>): Promise<any> {
    try {
      // Use Next.js API route proxy to avoid CORS issues
      const response = await fetch('/api/matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceIp: this.baseUrl.replace('http://', ''),
          command
        }),
      });

      // Always try to parse the response
      const data = await response.json();

      // Check if the response contains an error field (API returns errors with status 200 now)
      if (data.error) {
        return { error: data.error, success: false };
      }

      return data;
    } catch (error) {
      // Catch network errors (fetch failed, timeout, etc.) and return silently
      return {
        error: error instanceof Error ? error.message : 'Network error - device unreachable',
        success: false
      };
    }
  }

  // Get current switch status
  async getStatus(): Promise<MatrixStatus> {
    const response = await this.sendCommand({ COMMAND: 'GETSWS' });

    // Check if response indicates an error - return empty status silently
    if (response && response.error) {
      return { outputs: [] };
    }

    // Parse response to extract output->input mappings
    return this.parseStatusResponse(response);
  }

  // Switch input to output(s)
  async switchInputToOutputs(inputNum: number, outputNums: number[]): Promise<void> {
    const outputs = outputNums.join(' ');
    const command = `SW ${inputNum} ${outputs}`;
    console.log(`✓ Switching: Input ${inputNum} → Output(s) ${outputs}`);
    const response = await this.sendCommand({ COMMAND: command });

    // Check for errors first - log but don't throw to prevent Next.js error overlay
    if (response && response.error) {
      // Silently return - connection monitoring will handle disconnection
      return;
    }

    // Device returns {"result":"1"} on success
    if (response && response.result === "1") {
      console.log('✓ Switch command executed successfully on device');
    } else if (response && response.result === "0") {
      console.warn('⚠ Command may have failed - device returned result:0');
    } else {
      console.warn('⚠ Unexpected response:', response);
    }

    // Check if response includes updated status (it doesn't, but check anyway)
    if (response && response.SWS) {
      console.log('Device returned updated status:', response.SWS);
      return response; // Return status if available
    }
  }

  // Switch all outputs to one input
  async switchAllToInput(inputNum: number): Promise<void> {
    await this.sendCommand({ COMMAND: `SWALL ${inputNum}` });
  }

  // Set input label
  async setInputLabel(inputNum: number, label: string): Promise<void> {
    await this.sendCommand({
      COMMAND: 'SETNVRAM',
      FIELD: `Input${inputNum}Lab`,
      VALUE: label,
    });
  }

  // Set output label
  async setOutputLabel(outputNum: number, label: string): Promise<void> {
    await this.sendCommand({
      COMMAND: 'SETNVRAM',
      FIELD: `Output${outputNum}Lab`,
      VALUE: label,
    });
  }

  private parseStatusResponse(response: any): MatrixStatus {
    console.log('Parsing status response:', response);

    // Handle the actual device response format: {"SWS":"1 4 4 4 5 6 7 8"}
    // This means: Output 1→Input 1, Output 2→Input 4, Output 3→Input 4, etc.
    if (response && response.SWS) {
      const inputNumbers = response.SWS.split(' ').map((num: string) => parseInt(num, 10));
      console.log('Parsed switch status:', inputNumbers);
      return { outputs: inputNumbers };
    }

    // Return null outputs to indicate no data (don't update)
    console.log('No SWS data in response');
    return { outputs: [] };
  }
}

// Helper to create client instance
export function createMatrixClient(deviceIp: string): MatrixApiClient {
  return new MatrixApiClient(deviceIp);
}
