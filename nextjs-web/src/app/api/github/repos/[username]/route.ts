import { NextRequest, NextResponse } from 'next/server';

// 后端API的基础URL
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!BACKEND_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not set');
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const { searchParams } = new URL(request.url);

    // 构建后端API URL
    const backendUrl = new URL(`${BACKEND_API_URL}/github/repos/${username}`);

    // 转发所有查询参数
    searchParams.forEach((value, key) => {
      backendUrl.searchParams.append(key, value);
    });

    // 调用后端API
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `请求失败: ${response.status}`
      }));

      return NextResponse.json(
        { error: errorData.message || '请求失败' },
        { status: response.status }
      );
    }

    const data = await response.json();

    // 返回数据，设置CORS头部（如果需要）
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('GitHub API代理错误:', error);

    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 