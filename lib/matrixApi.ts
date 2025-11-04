// Matrix switch API client with Basic Auth

export interface MatrixStatus {
  outputs: number[]; // Array where index = output number (0-7), value = input number (1-8)
}

export class MatrixApiClient {
  private baseUrl: string;
  private proxyTunnelUrl: string | undefined;
  private username = 'admin';
  private password = 'admin';
  private useDirectConnection = false;

  constructor(deviceIp: string, proxyTunnelUrl?: string) {
    this.baseUrl = `http://${deviceIp}`;
    this.proxyTunnelUrl = proxyTunnelUrl;
    // Try to detect if we can use direct connection (same origin or CORS allowed)
    this.detectConnectionMode();
  }

  private async detectConnectionMode() {
    // Determine if we should use API proxy or direct browser→device connection
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;

      // Check if this is a self-hosted server (local network or localhost)
      const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
      const isLocalIP = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(hostname);
      const isLocalDomain = hostname.endsWith('.local'); // e.g., raspberrypi.local
      const isBareHostname = !hostname.includes('.') && hostname !== 'localhost'; // e.g., radar, myserver

      // Use API proxy for self-hosted servers, direct connection for cloud (Vercel)
      const isSelfHosted = isLocalhost || isLocalIP || isLocalDomain || isBareHostname;
      this.useDirectConnection = !isSelfHosted;

      if (isSelfHosted) {
        console.log('✓ Using API proxy (self-hosted mode)');
        console.log(`  Server: ${hostname}`);
      } else {
        console.log('✓ Using direct browser→device connection (cloud mode)');
        console.log(`  Hostname: ${hostname}`);
        console.log('ℹ️ If blocked by CORS, use Chrome with --disable-web-security flag');
      }
    }
  }

  private async sendDirectCommand(command: Record<string, unknown>): Promise<any> {
    try {
      const auth = btoa(`${this.username}:${this.password}`);
      const matrixdataString = JSON.stringify(command);
      const requestBody = `matrixdata=${encodeURIComponent(matrixdataString)}`;

      const response = await fetch(`${this.baseUrl}/cgi-bin/matrixs.cgi`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody,
      });

      if (!response.ok) {
        return {
          error: `Device returned ${response.status}: ${response.statusText}`,
          success: false
        };
      }

      const responseText = await response.text();
      try {
        return JSON.parse(responseText);
      } catch {
        return { error: 'Device returned invalid JSON', success: false };
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Direct connection failed - CORS may be blocking',
        success: false
      };
    }
  }

  private async sendCommand(command: Record<string, unknown>): Promise<any> {
    // If proxy tunnel URL is configured, use it directly (bypasses local network)
    if (this.proxyTunnelUrl) {
      return this.sendViaTunnel(command);
    }

    // On production (Vercel), use direct browser→device connection
    if (this.useDirectConnection) {
      return this.sendDirectCommand(command);
    }

    // On localhost, use API proxy (works perfectly)
    try {
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

  private async sendViaTunnel(command: Record<string, unknown>): Promise<any> {
    try {
      console.log('✓ Using Cloudflare Tunnel:', this.proxyTunnelUrl);

      const response = await fetch(`${this.proxyTunnelUrl}/matrix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });

      const data = await response.json();

      // Check if the response contains an error field
      if (data.error) {
        return { error: data.error, success: false };
      }

      // Extract the actual data from the proxy response
      return data.data || data;
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Tunnel connection failed',
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
export function createMatrixClient(deviceIp: string, proxyTunnelUrl?: string): MatrixApiClient {
  return new MatrixApiClient(deviceIp, proxyTunnelUrl);
}
