import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint that returns detailed information about the request
export async function POST(request: NextRequest) {
  try {
    const { deviceIp, command } = await request.json();

    console.log('\n========== DEBUG REQUEST ==========');
    console.log('Device IP:', deviceIp);
    console.log('Command:', JSON.stringify(command, null, 2));
    console.log('\nClient Request Headers:');
    console.log('User-Agent:', request.headers.get('user-agent'));
    console.log('Accept:', request.headers.get('accept'));
    console.log('Content-Type:', request.headers.get('content-type'));
    console.log('Origin:', request.headers.get('origin'));
    console.log('Referer:', request.headers.get('referer'));
    console.log('All headers:', JSON.stringify(Object.fromEntries(request.headers.entries()), null, 2));

    const auth = Buffer.from('admin:admin').toString('base64');
    const url = `http://${deviceIp}/cgi-bin/matrixs.cgi`;

    // Use CORRECT format: application/x-www-form-urlencoded (same as main endpoint)
    const matrixdataString = JSON.stringify(command);
    const requestBody = `matrixdata=${encodeURIComponent(matrixdataString)}`;

    console.log('\nFull URL:', url);
    console.log('Auth header:', `Basic ${auth}`);
    console.log('Request body:', requestBody);
    console.log('Content-Type: application/x-www-form-urlencoded');

    console.log('\nSending request...');
    const startTime = Date.now();

    // Add timeout to match main endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': '*/*',
          'User-Agent': 'DisplayStudio/1.0',
          'Connection': 'close', // Force connection close
        },
        body: requestBody,
        signal: controller.signal,
        // Add cache control for Safari compatibility
        cache: 'no-store',
        // Ensure connection is not reused (may help with Safari)
        keepalive: false,
      });

      clearTimeout(timeoutId);
      const endTime = Date.now();
      const responseText = await response.text();

      console.log('\n---------- RESPONSE ----------');
      console.log('Status:', response.status, response.statusText);
      console.log('Time:', `${endTime - startTime}ms`);
      console.log('Content-Type:', response.headers.get('content-type'));
      console.log('Response body:', responseText);
      console.log('========== END DEBUG ==========\n');

      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        parsedResponse = { raw: responseText };
      }

      return NextResponse.json({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        responseTime: `${endTime - startTime}ms`,
        body: parsedResponse,
        rawBody: responseText,
        requestDetails: {
          url,
          method: 'POST',
          contentType: 'application/x-www-form-urlencoded',
          bodyFormat: requestBody,
        }
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      console.log('\n---------- FETCH ERROR ----------');
      console.log('Error name:', fetchError.name);
      console.log('Error message:', fetchError.message);
      console.log('Error cause:', fetchError.cause);
      console.log('========== END ERROR ==========\n');

      let errorDetails = {
        success: false,
        error: fetchError.message,
        errorType: fetchError.name,
        errorCause: fetchError.cause?.toString(),
        isTimeout: fetchError.name === 'AbortError',
      };

      return NextResponse.json(errorDetails);
    }
  } catch (error: any) {
    console.error('\n========== OUTER ERROR ==========');
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('========== END ERROR ==========\n');

    return NextResponse.json({
      success: false,
      error: error.message || 'Unknown error',
      errorType: error.name,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
