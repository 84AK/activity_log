# Vercel 배포 최적화 작업 로그

- **작업 일시:** 2026년 03월 18일
- **수정자:** 서기 (Scribe)

## 1. 작업 개요
기존 GitHub Pages 기반의 정적 빌드(`next export`) 설정을 Vercel의 서버리스(Serverless) 플랫폼에 적합하도록 최적화합니다.

## 2. 변경 사항 (수정 내용)

### 📄 [next.config.ts](file:///Users/byunmose/Desktop/vibe_coding/Tutorial/AI_Study/team-building/next.config.ts)

| 기존 설정 | 변경 (삭제) | 사유 |
| :--- | :--- | :--- |
| `output: 'export'` | ❌ 삭제 | Vercel의 API Routes, SSR, Middleware를 사용하기 위해 기본 서비리스 모드로 전환 |
| `basePath: basePath` | ❌ 삭제 | GitHub Pages 서브디렉토리 경로 충돌 방지 (Vercel은 루트 기준) |
| `images.unoptimized` | ❌ 삭제 | Vercel의 우수한 자동 이미지 최적화 기능(Next Image)을 온전히 활용하기 위함 |

### 🛠 배포 파이프라인 정리

- **기존:** `.github/workflows/nextjs.yml` (GitHub Pages 자동 배포)
- **변경:** `.github/workflows/nextjs.yml.bak` 으로 이름 변경 (비활성화)
- **이유:** Vercel은 GitHub 저장소에 레포지토리를 직접 연동하여 빌드를 하므로 기존 액션 파일과 빌드 충돌 및 중복 실행을 막기 위함입니다.

## 3. 에러 및 해결 (Fix)
- **특이사항:** 특별한 에러는 발생하지 않았으며, 향후 Vercel에서 구동할 때 발생 가능한 API Route 등의 서버리스 환경 구성을 위해 필수적인 선행 작업을 완료했습니다.

## 4. 향후 작업 (Next Steps)
- Vercel 대시보드에서 해당 Git 저장소를 연동하여 배포를 완료해야 합니다.
- `.env.local`에 정의된 `NEXT_PUBLIC_APPS_SCRIPT_URL` 같은 환경변수들을 Vercel 프로젝트 설정(Environment Variables)에 등록해주어야 정상 작동합니다.

---
💡 *아크랩스 홈페이지:* [https://litt.ly/aklabs](https://litt.ly/aklabs)
