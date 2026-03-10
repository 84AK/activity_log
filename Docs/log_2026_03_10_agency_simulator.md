# 📝 작업 로그 (Log)

**작업일자:** 2026년 3월 10일  
**작업자:** 서기 (Doc) & 전체 팀 협업  
**작업 내용:** 마케팅 에이전시 시뮬레이터 MVP 구축 (Phase 1 ~ Phase 4 반영) -> **주차별 팀 실습 기록 장부로 컨셉 전면 피봇(Pivot)**

---

## 🏗️ 1. 구조 설계 및 스택 선정 (Blueprint)
- 일반적인 스터디 기록 앱보다는 "마케팅 에이전시"라는 컨셉을 도입하여 사용자의 재미와 몰입도 향상을 목표로 기획함 -> *(피드백 반영) 본래 스터디 목적에 맞게 에이전시 컨셉을 지우고 직관적인 **'주차(Week) & 팀(Team)'별 실습 기록 장부**로 설계를 피봇함.*
- 최신 2026년 프론트엔드 지침에 따라 `Next.js App Router`, `Tailwind CSS V4+`, `Framer Motion` 도입.
- DB는 직관성을 위해 `Google Sheets` API를 채택.
- **[수정 완료]** 스프레드시트의 데이터 스키마를 `[ID, Week, Team, Author, Prompt, Link, Summary, Score, Model, Date]` 구조로 전면 확장 변경함.

## 🎨 2. 사용자 인터페이스 (UI Polish)
- **Bento Grid Layout 갤러리 뷰:** 중요 정보 및 프롬프트 요약을 타일 형태로 배치하여 직관적으로 확인 가능하도록 구성.
- **Glassmorphism 2.0:** 다크 모드 기반의 네온/블러 콤보를 적용. `.glass-panel` 및 `.text-glow` 유틸리티 CSS를 `globals.css` 에 정의하여 사용.
- **[추가 완료]** `AnimatePresence`를 활용한 팝업 입력 폼(Input Modal)을 제작하여 자연스러운 페이드 인/아웃 효과와 세련된 입력단 제공.

## ⚙️ 3. 핵심 로직 구현 (Worker & Fix)
- **[구현/수정] Sheets API:** `/api/sheets` 경로에 `GET`, `POST` 로직을 분리. 변경된 `WeeklyLogs` 스키마(주차, 프롬프트, 첨부링크 등) 필드를 받도록 리팩토링.
  - *결과:* 환경 변수(`SPREADSHEET_ID`, `PRIVATE_KEY` 등) 설정 후 정상 작동 가능.
- **[구현] Gemini API (최신 다중 모델 연동):** `/api/gemini` 를 통해 4종류의 최신 모델을 상황에 맞춰 사용할 수 있도록 설계 완료.
  - `gemini-3.1-pro-preview`
  - `gemini-3.1-flash-lite-preview`
  - `gemini-3-flash-preview`
  - `gemini-2.5-pro`
  - 프론트엔드 입력 폼에서 `modelType`을 선택하고 프롬프트와 요약을 전송하면 AI의 Score (JSON 파싱 로직 포함) 정삭 추출 후 DB에 함께 저장함.

## 🛠️ 해결된 에러/난관 사항
1. **문제:** 최신 `Tailwind v4` 적용 시 과거 방식의 테마 설정(`tailwind.config.ts`) 사용이 어색함.
   **해결:** `globals.css` 내부 `@theme` 블록에서 native variable 형식으로 `color` 및 폰트 `font-sans` 등을 선언하여 의존성 없는 네이티브 방식으로 해결 완료. 
2. **문제:** 마크다운 혼합 텍스트로 리턴되는 Gemini의 결과에서 JSON 파싱 에러 발생 가능성.
   **해결:** `Fix(해결자)` 관점에서 정규 표현식 `/$\`\`\`json\n([\s\S]*?)\n\`\`\`$/` 및 fallback try-catch 처리를 하여 API 에러 500 방지.
3. **업데이트:** 대시보드 페이지 전체 한국어 지역화(Localization) 완료.
4. **업데이트:** [Pivot 반영] Apps Script 연동용 파일 `Docs/google_apps_script.js` 생성 및 데이터 스키마(주차/프롬프트/미디어링크) 추가 적용오.
5. **업데이트:** [Pivot 반영] 빈 상태(Empty State) 디자인 추가 및 프롬프트 전용 모달 폼(Modal Form) 레이아웃 생성 성공. (ts `Sparkles` 아이콘 Import 누락건 Fix 완료)

## 🚀 향후 과제
- `New Campaign` 입력 폼의 미디어 파일 실제 서버/S3 업로드 처리 확장 (현재는 단순 외부 URL 링크 삽입 형태)
- 환경 변수 `.env.local` 최종 세팅 후 실제 통합테스트 및 배포 (Vercel 환경 추천)
- 팀별/개인별 히스토리 필터 데이터 처리 연동.
