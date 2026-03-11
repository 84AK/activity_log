# 작업 로그: CORS 에러 해결 및 로그인 기능 복구

**날짜:** 2026년 3월 11일
**담당:** 서기 (Scribe)

## 1. 수정 배경 (Context)
GitHub Pages에 배포된 `team-building` 프로젝트에서 로그인 시 "서버 통신 중 오류가 발생했습니다."라는 메시지와 함께 인증이 실패하는 현상이 발생했습니다. 브라우저 콘솔 확인 결과, 구글 앱스 스크립트(GAS) API 호출 시 CORS 정책에 의해 Preflight 요청이 차단되는 문제로 확인되었습니다.

## 2. 발생 에러 (Error)
```
Access to fetch at 'https://script.google.com/macros/s/.../exec' from origin 'https://84ak.github.io' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## 3. 원인 분석 (Root Cause)
- 클라이언트에서 `Content-Type: application/json` 헤더를 포함하여 POST 요청을 보낼 때, 브라우저는 안전을 위해 `OPTIONS` 메서드를 사용하는 Preflight 요청을 먼저 보냅니다.
- 구글 앱스 스크립트(GAS) 웹 앱은 이 Preflight 요청에 대해 적절한 CORS 응답 헤더를 보내지 않아 브라우저 단에서 요청이 차단되었습니다.

## 4. 해결 방법 (Solution)
- `fetch` 요청의 `Content-Type`을 `text/plain`으로 변경했습니다.
- `text/plain`은 **Simple Request**로 간주되어 Preflight 요청을 유발하지 않습니다.
- GAS 서버 측에서는 `e.postData.contents`를 통해 전달된 JSON 문자열을 `JSON.parse`하여 정상적으로 처리할 수 있으므로 최소한의 수정으로 문제를 해결했습니다.

## 5. 구현 내용 (Implementation)
- `src/app/page.tsx` 파일의 다음 기능들에서 `fetch` 옵션을 수정함:
    - `handleAuthAction`: 로그인/회원가입 요청
    - `handleSubmit`: 실습 기록 추가/수정 요청
    - `handleDelete`: 실습 기록 삭제 요청

```tsx
// 변경 전
headers: { "Content-Type": "application/json" }

// 변경 후
headers: { "Content-Type": "text/plain" }
```

## 6. 결과 (Verification)
- 수정 후 POST 요청 시 `OPTIONS` 요청 없이 바로 데이터가 전송되므로 CORS 에러를 회피할 수 있습니다.
- 사용자에게 배포 후 확인을 요청할 예정입니다.
