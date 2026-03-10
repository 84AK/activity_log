# 프로젝트 개발 로그 (Development History Log)

## 📌 개요
- **프로젝트 명:** 팀별 주차별 활동 기록 장부 (Team Weekly Activity Log)
- **최종 업데이트:** 2026-03-10
- **역할:** 서기 (Doc)

---

## 🛠 구현 및 수정 내역 (Implementation & Fixes)

### 1. 초기 아키텍처 및 데이터베이스 (Phase 1-4)
- **내용**: Next.js 기반 프론트엔드와 Google Sheets를 결합한 아키텍처 설계.
- **해결**: 구글 앱스 스크립트(GAS)를 미들웨어로 사용하여 Sheets API 권한 이슈 해결 및 속도 최적화.

### 2. 권한 및 로그인 시스템 (Phase 5-8)
- **기능**: 사용자별/관리자별 권한 분리 및 전용 회원가입/로그인 구현.
- **에러**: 숫자 비밀번호 입력 시 구글 시트 데이터 타입 불일치로 인한 로그인 실패 발생.
- **해결**: 모든 데이터 대조 시 `.toString()` 처리를 통해 타입 안정성 확보.
- **개선**: 비밀번호 가시성 토글(눈 아이콘) 및 가입 날짜 포맷팅(`yyyy-MM-dd HH:mm:ss`) 적용.

### 3. 통합 포털 및 사용자 가이드 (Phase 9)
- **기능**: 벤토 그리드(Bento Grid) 기반의 랜딩 페이지 구축.
- **연동**: 마케팅 시뮬레이션 앱 '셀스타그램' 외부 링크 연결.
- **가이드**: 구글 드라이브 공유 링크 추출 및 앱 사용법 섹션 추가.

### 4. GitHub Actions 자동 배포 (Phase 10)
- **설계**: GitHub Pages 정적 배포(`next export`) 환경 구축.
- **수정**: 서버리스 환경 대응을 위해 Backend Route(`src/app/api`)를 폐쇄하고, 프론트엔드 직접 API 호출 방식으로 전환.
- **자동화**: `.github/workflows/nextjs.yml`을 통한 푸시 시 자동 배포 파이프라인 완성.

---

## ⚠️ 기술적 주의사항 (Technical Notes)
- **Base Path**: GitHub Pages 배포 시 저장소명(`/activity_log`)이 URL에 포함되므로 `next.config.ts`의 `basePath` 설정을 유지해야 합니다.
- **CORS**: 구글 앱스 스크립트 URL로직접 호출 시 브라우저 정책에 따라 Redirect 처리가 필요할 수 있으나, 현재 `fetch` 구조에서 정상 작동 확인됨.
- **Secrets**: 중요 환경 변수(`NEXT_PUBLIC_APPS_SCRIPT_URL`)는 GitHub Repository Secrets에 등록하여 관리할 수 있습니다.

---

## 🚀 향후 과제 (Backlog)
- 데이터 양이 많아질 경우 데이터 페이징(Pagination) 처리 필요.
- 사용자별 프로필 이미지 기능 추가 고려.
