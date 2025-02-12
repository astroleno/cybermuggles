import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const apiKey = req.headers.get('Authorization');
    const apiUrl = `http://${process.env.API_HOST || 'aitoshuu.art'}:${process.env.API_PORT || '4120'}${process.env.API_PATH || '/v1/chat/completions'}`;
    
    console.log('Attempting to fetch from:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey || '',
        'Accept': 'text/event-stream',
      },
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

    // 使用 TransformStream 来处理流式响应
    const transformStream = new TransformStream();
    response.body?.pipeTo(transformStream.writable);

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
    console.error('Proxy error:', error);
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