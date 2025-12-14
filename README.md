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

- graphql/apollo 환경에서 리프레시토큰 기반 인증 로직을 직접 추상화하여 인증 인터셉터 구현

- `src/modules/createLink.ts`

  - `src/modules/refreshTokenAdapter.ts`
  - `src/pages/api/tokens.ts`
  - `src/pages/api/auth/refresh.ts`

- 코드의 구조

- 설계 의도

  - axios, react-query 에 비해 graphql/apollo에서 리프레시토큰 사용의 제약이 있었는지. 차이점이 있는지 위주로 서술 해야함.
  - 차이점 : axios는 promise방식이고 apollo는 Observable방식으로 interceptor를 구현해야한다.

- 핵심 논리
