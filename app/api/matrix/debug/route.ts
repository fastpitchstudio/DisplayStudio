import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint that returns detailed information about the request
export async function POST(request: NextRequest) {
  try {
    const { deviceIp, command } = await request.json();

    console.log('\n========== DEBUG REQUEST ==========');
    console.log('Device IP:', deviceIp);
    console.log('Command:', JSON.stringify(command, null, 2));

    const auth = Buffer.from('admin:admin').toString('base64');
    const url = `http://${deviceIp}/cgi-bin/matrixs.cgi`;
    const requestBody = JSON.stringify({ matrixdata: command });

    console.log('\nFull URL:', url);
    console.log('Auth header:', `Basic ${auth}`);
    console.log('Request body:', requestBody);

    console.log('\nSending request...');
    const startTime = Date.now();

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

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
    });
  } catch (error: any) {
    console.error('\n========== ERROR ==========');
    console.error(error);
    console.error('========== END ERROR ==========\n');

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
