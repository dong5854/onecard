# ONE CARD — Web Game

## 프로젝트 개요
- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS, DaisyUI, 픽셀 아트 테마 컴포넌트
- **상태 관리**: Nest 기반 `onecard-server` 게임 세션을 REST API로 제어하는 커스텀 훅(`useOneCardGame`)
- **지원 모드**: 싱글 플레이 (AI 상대 최대 3명)
- **스토리북**: 핵심 UI 컴포넌트 개발 및 회귀 테스트 용도

## 실행 방법
```bash
cp .env.example .env.local # ONECARD_SERVER_URL 조정
npm install
# 서버 기본 포트(예: 3000)로 onecard-server 실행
npm run dev
```

`http://localhost:3000` 접속 후 게임을 시작할 수 있습니다. `npm run storybook`으로 UI 컴포넌트를 개별 확인할 수 있습니다.

### 환경 변수
| 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `ONECARD_SERVER_URL` | `http://localhost:3000` | Next.js Route Handler(`/api/games`)가 프록시할 실제 Nest API 주소. Next.js 앱 내부에서는 상대 경로(`/api/...`)만 사용하므로 브라우저에 노출되지 않습니다. |
