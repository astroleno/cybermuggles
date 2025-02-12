import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = await req.json();
    const apiKey = req.headers.get('Authorization');

    const response = await fetch(`http://${process.env.API_HOST || 'aitoshuu.art'}${process.env.API_PATH || '/v1/chat/completions'}`, {
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
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        errorText
      });
      return new Response(
        JSON.stringify({
          error: 'API Error',
          message: `${response.status} ${response.statusText}`,
          details: errorText
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json'
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
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(
      JSON.stringify({
        error: 'Proxy error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 