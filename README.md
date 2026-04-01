# AI 실습 및 마케팅 통합 포털 (AI Activity Portal v2.1)

AI 스터디 그룹의 지식 공유와 원활한 실습 내역 추적을 위해 제작된 2026년 최신 웹 애플리케이션입니다.
각 팀의 실습 날짜, 사용된 AI 모델, 프롬프트, 결과물을 직관적인 UI로 기록하고 열람할 수 있습니다.

> [!TIP]
> 본 프로젝트는 **아크랩스(AKLabs)** 강의/실습의 일환으로 제작되었습니다.
> 👉 **[아크랩스 공식 홈페이지](https://litt.ly/aklabs)**

## 🚀 주요 기능 (New in v2.1)
1. **날짜 기반 활동 관리 (Date-Based Logging):**
   - 기존의 주차 드롭다운 대신 **날짜 선택기(Date Picker)**를 도입하여 정확한 실습 시점을 기록합니다.
2. **AI 모델 및 별점 기록:**
   - 어떤 AI 모델(Gemini, GPT 등)을 사용했는지, 실습 만족도(1-5점)는 어떠했는지 상세히 아카이빙합니다.
3. **고급 카드 UI & 상세보기:**
   - **프롬프트 복사**: 카드에서 즉시 프롬프트를 클립보드에 복사할 수 있습니다.
   - **상세보기 모달**: 긴 프롬프트와 요약 내용을 마크다운이 적용된 고해상도 모달로 확인합니다.
4. **보안 강화 및 관리자 편의:**
   - 관리자 비밀번호를 환경 변수로 분리하여 보안을 강화했습니다.
   - 자료실 및 실습 기록의 수정/삭제 권한 최적화.

## 🛠 기술 스택 (Tech Stack)
- **Framework:** Next.js (App Router), React 19
- **Styling:** Tailwind CSS (V4+), Lucide Icons
- **Animations:** Framer Motion, CSS Native View Transitions
- **Data Store:** Google Sheets API (via Apps Script)
- **Content:** React-Markdown (GFM support)

## 📋 개발팀 역할 및 기여 (v2.1)
- **Blueprint (건축가):** 날짜 중심 데이터 구조 설계 및 11개 컬럼 백엔드 스키마 확장.
- **Worker (작업자):** 상세보기 모달 및 카드 텍스트 생략(Truncation) 로직 구현.
- **Fix (해결사):** 코드 충돌로 인한 파일 구조 파손 긴급 복구 및 빌드 오류 수정.
- **UI Polish (디자이너):** 별점 버튼 및 상세보기 모달의 다크모드 글래스모피즘 디자인 고도화.
- **Doc (서기):** v2.1 작업 로그 및 README 업데이트.

---
최종 업데이트: 2026-04-01 (v2.1 정식 릴리즈)
