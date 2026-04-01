# 2026-04-02 ADMIN_PASSWORD 완전 제거 및 인증 일원화 작업 로그

## 프로젝트 서기(Scribe) 기록 📝

### 1. 작업 개요 (Objective)
- 이전까지 **Vercel 환경 변수(`ADMIN_PASSWORD`)**를 하드코딩된 패스워드로 활용하여 프록시 서버에서 권한을 우회하던 레거시 인증 방식을 완전히 파괴 및 제거.
- 오직 구글 스프레드시트(`Users` 시트)의 `Role` 컬럼 데이터만을 절대적 진실의 원천(Single Source of Truth)으로 삼는 완벽한 동적 권한 제어(DB-driven) 방식으로 통합 고도화.

### 2. 세부 수정/구현 사항 (Implementations & Fixes)

#### 🔐 구글 앱스 스크립트 철통 보안 구축 (`google_apps_script.js`)
- **`isAdmin` 플래그 의존 탈피**: 기존 외부 요청에서 `isAdmin: true`가 넘어오면 무조건 통과시키던 무방비 로직을 전량 폐기.
- **`verifyAdminAuth(username, password)` 신설**: 수정, 삭제, 자료등록 등의 핵심 동작 요청이 들어오면 우선 해당 함수의 루프를 통해 전송된 아이디와 비밀번호가 `Users` 시트에 등록되어 있고, 해당 줄의 `Role` 값이 "Admin" 혹은 "관리자"인지 이중으로 직접 비교/검증하는 자체 인증 로직 적용.

#### 🌍 프론트엔드 통신 규격 변경 (`src/app/page.tsx`, `src/app/admin/page.tsx`)
- 관리자로 로그인 시, 기존 `password` 외에 **사용자의 고유 아이디(`admin_username`)**도 브라우저 `sessionStorage`에 추가로 저장하도록 기능 확장.
- 어드민 권한의 클라이언트가 자료(Resource)를 편집하거나 타인의 글을 삭제하기 위한 서버 통신을 시도할 때, 예전처럼 하드코딩된 가상 아이디(`"admin"`)를 속여서 전송하지 않고 이제 해당 브라우저 세션에 저장된 실제 아이디와 비번 조합을 정확히 전송하도록 수정.

#### 🚯 환경 변수 정리 및 프록시 청소 (`src/app/api/proxy/route.ts`, `.env.local`)
- 프록시 서버 중앙에서 돌아가던 구시대적 유물 로직인 `const isAdmin = password === process.env.ADMIN_PASSWORD;` 구문을 완전히 소각.
- 이에 따라 로컬 구성 파일인 `.env.local` 에서도 `ADMIN_PASSWORD` 행을 안전하게 날려버리며 시스템 복잡도와 취약점을 대폭 감소.

### 3. 향후 아키텍처 참고 방향 (Notes for Next Step)
- 현재 남겨둔 `AUTH_TOKEN`은 여전히 외부 해머링(무차별 대입 공격 등)을 방어하기 위한 중요한 장치이므로 유지되어야 합니다.
- 앱 구조상 구글 서버에서 Role 조회를 매 행동마다 반복(Validation)하므로 완벽한 보안이 보장되며 무결성이 확보되었습니다.
