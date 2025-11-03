# ONE CARD — Web Game

## 프로젝트 개요
- **Framework**: Next.js 14 (App Router) + TypeScript
- **UI**: Tailwind CSS, DaisyUI, 픽셀 아트 테마 컴포넌트
- **상태 관리**: `useReducer` 기반 커스텀 훅 (`useOneCardGame`)
- **지원 모드**: 싱글 플레이 (AI 상대 최대 3명)
- **스토리북**: 핵심 UI 컴포넌트 개발 및 회귀 테스트 용도

## 실행 방법
```bash
npm install
npm run dev
```

`http://localhost:3000` 접속 후 게임을 시작할 수 있습니다. `npm run storybook`으로 UI 컴포넌트를 개별 확인할 수 있습니다.