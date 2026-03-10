# 프로젝트 최종 개발 로그 (Final Development History Log)

## 📌 프로젝트 개요 (Overview)
- **프로젝트 명:** 팀별 주차별 활동 기록 장부 (Team Weekly Activity Log)
- **최종 완료일:** 2026-03-10
- **역할:** 서기 (Doc) & 해결사 (Solver)

---

## 🛠 주요 작업 내역 (Work Summary)

### 1. 사용자 요구사항 반영 및 피봇 (Pivot)
- **초기**: 에이전시 시뮬레이터 컨셉으로 시작.
- **최종**: '팀별 주차별 활동 기록 및 공유 포털'로 방향 수정 및 대폭 개편. 벤토 그리드(Bento Grid) 레이아웃 적용.

### 2. 구글 시트 백엔드 고도화 (Backend)
- **데이터 구조**: `Logs`, `Users` 시트를 자동 생성하고 관리하는 Google Apps Script 구축.
- **인증 시스템**: 전용 회원가입 및 로그인 로직 구현. 숫자 비밀번호 인식 오류(`.toString()` 미흡) 완벽 해결.

### 3. 통합 포털 및 사용자 편의 (UI/UX)
- **포털 홈**: 마케팅 앱 '셀스타그램' 연동 및 구글 드라이브 링크 추출 가이드 제공.
- **피드백**: Toast 메시지(Framer Motion)를 통한 실시간 작업 상태 알림.
- **보안**: 본인 작성 글만 수정/삭제 가능하도록 검증 로직 강화.

### 4. 깃허브 자동 배포 (GitHub Actions & Pages)
- **설계**: `next export`를 이용한 정적 사이트 배포 파이프라인 구축.
- **최종 주소**: [https://84AK.github.io/activity_log/](https://84AK.github.io/activity_log/)

---

## ⚡️ 배포 트러블슈팅 기록 (Deployment Troubleshooting)

### **문제 1: HttpError: Not Found**
- **원인**: 깃허브 저장소 설정(`Settings > Pages`)에서 소스가 `GitHub Actions`가 아닌 기본값(`Deploy from a branch`)으로 되어 있어 배포 대상(Pages Site)을 찾지 못함.
- **해결**: 사용자 가이드를 통해 `Source` 설정을 `GitHub Actions`로 변경 유도.

### **문제 2: Exit Code 2 (Install 단계)**
- **원인**: `npm ci` 명령어가 로컬의 `package-lock.json`과 깃허브 서버의 환경 차이로 인해 엄격하게 실패함.
- **해결**: 좀 더 유연한 `npm install` 방식으로 명령어를 교체하여 빌드 환경 안정화.

### **문제 3: out: No such file or directory (Upload 단계)**
- **원인**: 자동화된 넥스트 빌드 도구(`static_site_generator: next`)가 `basePath`가 설정된 환경에서 빌드 결과물(`out`) 폴더의 위치를 오판함.
- **해결**: `nextjs.yml`을 수동 빌드 방식(`npm run build`)으로 전면 개편하고, `out` 폴더를 명시적으로 업로드하도록 수정하여 해결.

---

## 📊 최종 소감
사용자의 피드백에 따라 프로젝트의 방향이 더 실용적이고 아름답게 진화했습니다. 특히 막바지 배포 과정에서의 난관들을 유기적인 협업으로 해결하여, 누구나 접속 가능한 완성도 높은 포털을 만들어낼 수 있었습니다. 

> **아크랩스(AKLabs)**의 모든 실습생들이 이 앱을 통해 더 즐겁게 학습하고 기록하길 바랍니다! ✨
