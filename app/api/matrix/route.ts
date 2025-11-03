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

    // Reduced logging for connection attempts
    // console.log('\n========================================');
    // console.log('[Matrix API] Request to:', `http://${deviceIp}/cgi-bin/matrixs.cgi`);
    // console.log('[Matrix API] Command object:', JSON.stringify(command, null, 2));

    const auth = Buffer.from('admin:admin').toString('base64');

    // Format the request body as form data (application/x-www-form-urlencoded)
    // The device expects: matrixdata={"COMMAND":"SW 1 2"}
    const matrixdataString = JSON.stringify(command);
    const requestBody = `matrixdata=${encodeURIComponent(matrixdataString)}`;
    // console.log('[Matrix API] Full request body:', requestBody);
    // console.log('[Matrix API] Auth header:', `Basic ${auth}`);

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`http://${deviceIp}/cgi-bin/matrixs.cgi`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*',
          'User-Agent': 'DisplayStudio/1.0',
        },
        body: requestBody,
        signal: controller.signal,
        // Add cache control for Safari compatibility
        cache: 'no-store',
        // Ensure connection is not reused (may help with Safari)
        keepalive: false,
      });
      clearTimeout(timeoutId);

      // Get response as text first to see what we got
      const responseText = await response.text();

      if (!response.ok) {
        // Return error as JSON without throwing
        return NextResponse.json(
          { error: `Device returned ${response.status}: ${response.statusText}` },
          { status: 200 } // Return 200 so client handles it gracefully
        );
      }

      // Try to parse as JSON
      try {
        const data = JSON.parse(responseText);
        return NextResponse.json(data);
      } catch (parseError) {
        // Return error as JSON without throwing
        return NextResponse.json(
          { error: 'Device returned invalid JSON. Check device IP and API endpoint.' },
          { status: 200 } // Return 200 so client handles it gracefully
        );
      }
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      // Handle fetch errors silently
      let errorMessage = 'Device unreachable';
      if (fetchError.name === 'AbortError') {
        errorMessage = 'Device request timed out after 10 seconds';
      } else if (fetchError.message) {
        errorMessage = fetchError.message;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 200 } // Return 200 so client handles it gracefully
      );
    }
  } catch (error: any) {
    // Return error as JSON without logging
    return NextResponse.json(
      { error: error.message || 'Device unreachable' },
      { status: 200 } // Return 200 so client handles it gracefully
    );
  }
}
