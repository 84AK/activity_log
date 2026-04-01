import { NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, password, ...payload } = body;

    // 1. 관리자 로그인 액션 처리 (서버에서 비밀번호 검증)
    if (action === 'login') {
      if (password === ADMIN_PASSWORD) {
        return NextResponse.json({ success: true, role: 'admin' });
      } else {
        return NextResponse.json({ success: false, message: '비밀번호가 일치하지 않습니다.' }, { status: 401 });
      }
    }

    // 2. 다른 액션들을 Apps Script로 전달 (Server-to-Server)
    if (!APPS_SCRIPT_URL) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // 보안 토큰 추가하여 Apps Script 호출
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        ...body,
        authToken: AUTH_TOKEN // 서버 간 인증을 위한 비밀 토큰 전달
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: 'Apps Script error', details: errorText }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
