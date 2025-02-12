import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 移除 edge runtime
// export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const apiKey = req.headers.get('Authorization');

    const response = await axios.post('http://124.222.75.42:4120/v1/chat/completions', body, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': apiKey || '',
        'Accept': 'text/event-stream',
      },
      responseType: 'stream'
    });

    // 转换 axios 的流响应为 Web 标准的 ReadableStream
    const stream = new ReadableStream({
      start(controller) {
        response.data.on('data', (chunk: Buffer) => {
          controller.enqueue(chunk);
        });
        response.data.on('end', () => {
          controller.close();
        });
        response.data.on('error', (err: Error) => {
          controller.error(err);
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { 
        error: 'Proxy error', 
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 