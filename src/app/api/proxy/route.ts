import { NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, password, ...payload } = body;

    const isAdmin = password === ADMIN_PASSWORD;

    // 1. 관리자 로그인 액션 처리 (서버에서 비밀번호 검증)
    if (action === 'login') {
      if (isAdmin) {
        return NextResponse.json({ success: true, role: 'admin' });
      } else {
        // ... (계속해서 학생 로그인 로직 진행 가능하도록 여기서는 리턴하지 않거나 로직 분리)
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
        isAdmin, // 관리자 여부 플래그 추가
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
