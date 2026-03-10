# 팀별 주차별 활동 기록 장부 (Team Weekly Activity Log)

AI 스터디 그룹의 지식 공유와 원활한 실습 내역 추적을 위해 제작된 2026년 최신 웹 애플리케이션입니다.
각 팀이 매 주차별로 어떤 프롬프트를 사용했고, 어떤 결과(이미지/영상 링크)를 얻었는지 직관적인 UI로 기록하고 열람할 수 있습니다.

> 본 프로젝트는 **아크랩스(AKLabs)** 강의/실습의 일환으로 제작되었습니다.
> 👉 **[아크랩스 바로가기](https://litt.ly/aklabs)**

## 주요 기능 (Features)
1. **주차별/팀별 아카이빙 (Bento Grid 갤러리):**
   - Glassmorphism 2.0 기반의 세련된 대시보드에서 팀의 주차별 실습 결과물, 프롬프트를 카드 형태로 모아볼 수 있습니다. 
2. **상세 기록 작성 폼 (Input Modal):**
   - 주차(Week), 팀명(Team), 프롬프트(Prompt), 첨부링크(미디어), 활동 요약을 쉽게 입력하고 저장합니다.
3. **Google Sheets 기반 DB 연동:**
   - 누구나 쉽게 관리 가능한 구글 스트레드시트를 백엔드 DB로 결합하여 투명하고 수정이 쉬운 데이터 구조를 가집니다.

## 기술 스택 (Tech Stack)
- **Framework:** Next.js (App Router), React 19
- **Styling:** Tailwind CSS (V4+), `lucide-react`
- **Animations:** Framer Motion, CSS Native View Transitions
- **Data Source:** Google Sheets API (`googleapis`) 

## 개발팀 롤플레잉 기록
- **Blueprint (건축가):** 초기 에이전시 컨셉에서 사용자 피드백을 수용하여 '직관적인 주차별 팀 기록'으로 요구사항 전면 피봇(Pivot) 및 설계 수정.
- **Worker (작업자):** 구글 시트 데이터 스키마 리팩토링 및 팝업 모달 폼(Form) State 구현 완료.
- **UI Polish (디자이너):** 갤러리형 벤토카드 스타일링 업데이트 및 데이터 입력 모달의 애니메이션 컴포넌트(`AnimatePresence`) 세팅.
- **Doc (서기):** 본 README 및 Docs 로그 갱신.

---
최종 배포 테스트 완료: 2026-03-10
