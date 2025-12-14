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

### 코드의 구조

```
src
├── constants
│   └── URL.ts
├── modules
│   ├── apolloClient.ts
│   ├── createApolloClient.ts
│   ├── createLink.ts ⭐ 핵심 — Observable 기반 인터셉터로 401 발생 시 토큰 재발급 및 요청 재시도 처리 로직
│   ├── mergeApolloCache.ts
│   ├── refreshTokenAdapter.ts ⭐ 핵심 — Refresh Token을 구현하기 위한 어댑터
│   └── serverSideProps.ts
└── pages
    ├── _app.tsx
    ├── _document.tsx
    ├── api
    │   ├── auth
    │   │   ├── login.ts ⭐ 핵심 — 로그인 처리 API (토큰쿠키 발급)
    │   │   └── refresh.ts ⭐ 핵심 — 토큰 재발급 API
    │   └── tokens.ts ⭐ 핵심 — 로그아웃 처리 API (토큰쿠키 제거)
    └── index.tsx
```

### 설계 의도

- axios, react-query 에 비해 graphql/apollo에서 리프레시토큰 사용의 제약이 있었는지. 차이점이 있는지 위주로 서술 해야함.
- 차이점 : axios는 promise방식이고 apollo는 apollo 자체적으로 만든 Observable방식으로 interceptor를 구현해야한다.

### 핵심 논리

- graphql/apollo 환경에서 리프레시토큰 기반 인증 로직을 직접 추상화하여 인증 인터셉터 구현
