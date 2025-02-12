import { NextRequest } from 'next/server';
import http from 'http';
import type { IncomingMessage } from 'http';

// Remove edge runtime
// export const runtime = 'edge';

export async function POST(req: NextRequest): Promise<Response> {
  return new Promise<Response>((resolve) => {
    const body = req.json();
    const apiKey = req.headers.get('Authorization');

    const options = {
      hostname: process.env.API_HOST || '124.222.75.42',
      port: parseInt(process.env.API_PORT || '4120'),
      path: process.env.API_PATH || '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey || '',
        'Accept': 'text/event-stream',
      },
      timeout: 30000, // 30 seconds timeout
    };

    const proxyReq = http.request(options, (proxyRes: IncomingMessage) => {
      if (proxyRes.statusCode !== 200) {
        let data = '';
        proxyRes.on('data', (chunk: Buffer) => {
          data += chunk;
        });
        proxyRes.on('end', () => {
          resolve(new Response(data, {
            status: proxyRes.statusCode,
            headers: {
              'Content-Type': 'application/json'
            }
          }));
        });
        return;
      }

      const headers = new Headers({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      });

      // Convert Node.js readable stream to Web API readable stream
      const stream = new ReadableStream({
        start(controller) {
          proxyRes.on('data', (chunk: Buffer) => {
            controller.enqueue(chunk);
          });
          proxyRes.on('end', () => {
            controller.close();
          });
          proxyRes.on('error', (err: Error) => {
            controller.error(err);
          });
        },
      });

      resolve(new Response(stream, { headers }));
    });

    proxyReq.on('error', (error: Error) => {
      console.error('Proxy error:', error);
      resolve(new Response(
        JSON.stringify({
          error: 'Proxy error',
          message: error.message,
          details: error.stack
        }),
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ));
    });

    // Set request timeout
    proxyReq.setTimeout(30000, () => {
      proxyReq.destroy();
      resolve(new Response(
        JSON.stringify({
          error: 'Timeout error',
          message: 'Request timed out after 30 seconds'
        }),
        { 
          status: 504,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ));
    });

    // Send the request body
    body.then(data => {
      proxyReq.write(JSON.stringify(data));
      proxyReq.end();
    }).catch(error => {
      console.error('Error parsing request body:', error);
      resolve(new Response(
        JSON.stringify({
          error: 'Request error',
          message: 'Failed to parse request body',
          details: error.message
        }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      ));
    });
  });
} 