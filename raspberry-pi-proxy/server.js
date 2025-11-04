import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MATRIX_DEVICE_IP = process.env.MATRIX_DEVICE_IP || '192.168.1.122';
const MATRIX_DEVICE_AUTH = process.env.MATRIX_DEVICE_AUTH || 'admin:admin';

// Enable CORS for all origins (Cloudflare Tunnel will handle this)
app.use(cors());

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    matrixDevice: MATRIX_DEVICE_IP,
    version: '1.0.0'
  });
});

// Matrix control endpoint - matches your existing API
app.post('/matrix', async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({
        error: 'Missing command parameter',
        success: false
      });
    }

    // Construct the matrix device URL
    const deviceUrl = `http://${MATRIX_DEVICE_IP}/cgi-bin/matrixs.cgi`;

    // Prepare Basic Auth header
    const authBuffer = Buffer.from(MATRIX_DEVICE_AUTH).toString('base64');

    // Prepare form data (same format as your existing API)
    const formData = new URLSearchParams();
    formData.append('matrixdata', JSON.stringify({ COMMAND: command }));

    console.log(`[${new Date().toISOString()}] Sending command to ${MATRIX_DEVICE_IP}: ${command}`);

    // Make request to matrix device
    const response = await fetch(deviceUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authBuffer}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();

    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }

    console.log(`[${new Date().toISOString()}] Response from device:`, result);

    // Return success response
    res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error:`, error.message);

    res.json({
      success: false,
      error: error.message,
    });
  }
});

// Debug endpoint (optional - matches your existing debug endpoint)
app.post('/matrix/debug', async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({
        error: 'Missing command parameter',
        success: false
      });
    }

    const deviceUrl = `http://${MATRIX_DEVICE_IP}/cgi-bin/matrixs.cgi`;
    const authBuffer = Buffer.from(MATRIX_DEVICE_AUTH).toString('base64');
    const formData = new URLSearchParams();
    formData.append('matrixdata', JSON.stringify({ COMMAND: command }));

    const response = await fetch(deviceUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authBuffer}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const responseText = await response.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { raw: responseText };
    }

    res.json({
      success: true,
      data: result,
      debug: {
        deviceUrl,
        command,
        responseStatus: response.status,
      }
    });

  } catch (error) {
    res.json({
      success: false,
      error: error.message,
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    success: false
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  Display Studio Proxy Server                               ║
╠════════════════════════════════════════════════════════════╣
║  Status:        Running                                    ║
║  Port:          ${PORT.toString().padEnd(42)}║
║  Matrix Device: ${MATRIX_DEVICE_IP.padEnd(42)}║
║  Started:       ${new Date().toISOString().padEnd(42)}║
╠════════════════════════════════════════════════════════════╣
║  Endpoints:                                                ║
║    POST /matrix         - Send commands to matrix device   ║
║    POST /matrix/debug   - Debug endpoint                   ║
║    GET  /health         - Health check                     ║
╚════════════════════════════════════════════════════════════╝
  `);
});
