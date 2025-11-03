import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { deviceIp, command } = await request.json();

    if (!deviceIp || !command) {
      return NextResponse.json(
        { error: 'Missing deviceIp or command' },
        { status: 400 }
      );
    }

    console.log('\n========================================');
    console.log('[Matrix API] Request to:', `http://${deviceIp}/cgi-bin/matrixs.cgi`);
    console.log('[Matrix API] Command object:', JSON.stringify(command, null, 2));

    const auth = Buffer.from('admin:admin').toString('base64');

    // Format the request body as form data (application/x-www-form-urlencoded)
    // The device expects: matrixdata={"COMMAND":"SW 1 2"}
    const matrixdataString = JSON.stringify(command);
    const requestBody = `matrixdata=${encodeURIComponent(matrixdataString)}`;
    console.log('[Matrix API] Full request body:', requestBody);
    console.log('[Matrix API] Auth header:', `Basic ${auth}`);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`http://${deviceIp}/cgi-bin/matrixs.cgi`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      console.log('[Matrix API] Device response status:', response.status);
      console.log('[Matrix API] Content-Type:', response.headers.get('content-type'));

      // Get response as text first to see what we got
      const responseText = await response.text();
      console.log('[Matrix API] Raw response:', responseText);
      console.log('========================================\n');

      if (!response.ok) {
        throw new Error(`Device returned ${response.status}: ${response.statusText}`);
      }

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText);
        console.log('[Matrix API] Parsed JSON:', data);
        return NextResponse.json(data);
      } catch (parseError) {
        console.error('[Matrix API] Failed to parse response as JSON');
        throw new Error('Device returned invalid JSON (probably HTML page). Check device IP and API endpoint.');
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Device request timed out after 10 seconds');
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('[Matrix API] Error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Device unreachable' },
      { status: 500 }
    );
  }
}
