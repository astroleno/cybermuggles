import { NextRequest } from 'next/server';

export const runtime = 'edge';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await delay(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const apiKey = req.headers.get('Authorization');
    
    // 验证请求体
    if (!body || !body.messages || !Array.isArray(body.messages)) {
      throw new Error('Invalid request body format');
    }

    // 获取并验证环境变量
    const apiHost = process.env.API_HOST;
    const apiPort = process.env.API_PORT;
    const apiPath = process.env.API_PATH;

    if (!apiHost || !apiPort || !apiPath) {
      console.error('Missing environment variables:', { apiHost, apiPort, apiPath });
      throw new Error('Missing required environment variables');
    }

    const apiUrl = `http://${apiHost}:${apiPort}${apiPath}`;
    
    console.log('Proxy configuration:', {
      host: apiHost,
      port: apiPort,
      path: apiPath,
      url: apiUrl,
      messageCount: body.messages.length
    });

    const requestHeaders = {
      'Content-Type': 'application/json',
      'Authorization': apiKey || '',
      'Accept': 'text/event-stream',
    };

    console.log('Making request with headers:', Object.fromEntries(Object.entries(requestHeaders).map(([k, v]) => [k, v.length > 50 ? v.substring(0, 50) + '...' : v])));

    const response = await fetchWithRetry(apiUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorDetails = {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        errorText,
        headers: Object.fromEntries(response.headers.entries())
      };
      console.error('API Error:', errorDetails);
      
      return new Response(
        JSON.stringify({
          error: 'API Error',
          message: `${response.status} ${response.statusText}`,
          details: errorText,
          requestUrl: apiUrl
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      );
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    // 使用 TransformStream 来处理流式响应
    const transformStream = new TransformStream();
    
    // 处理流式响应
    response.body.pipeTo(transformStream.writable).catch(error => {
      console.error('Stream processing error:', error);
      throw error;
    });

    return new Response(transformStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  } catch (error) {
    console.error('Proxy error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error
    });
    
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }
    );
  }
}

// 添加 OPTIONS 处理以支持 CORS 预检请求
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
} 