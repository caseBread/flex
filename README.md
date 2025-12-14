# flex Engineering Internship Assignment: Frontend

## 로컬 실행 환경

- node v22
- npm v10

## 로컬 실행 방법

```shell
npm install
npm run dev
# 브라우저에서 http://localhost:3000 접속
```

## 핵심 코드

- 리프레시토큰 기반 인증 로직을 직접 추상화하여 인증 인터셉터 구현

- `src/modules/createLink.ts`

  - `src/modules/refreshTokenAdapter.ts`
  - `src/pages/api/tokens.ts`
  - `src/pages/api/auth/refresh.ts`

- 코드의 구조

- 설계 의도

- 핵심 논리
