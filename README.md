# flex Engineering Internship Assignment: Frontend!

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
│
├── hooks
│   ├── useIsLoginedQuery.ts
│   ├── useRoleQuery.ts
│   └── useUserIdQuery.ts
│
├── modules
│   ├── api.ts                     ⭐ 핵심 — 모든 API 요청의 공통 진입점
│   ├── getRestoreAuthToken.ts
│   └── refreshTokenAdapter.ts     ⭐ 핵심 — 401 발생 시 요청 queue 관리 및 재시도 제어
│
├── utils
│   └── buildQuery.ts
│
├── pages
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── api
│   │   ├── auth
│   │   │   ├── login.ts           ⭐ 핵심 — 로그인 및 토큰 쿠키 발급
│   │   │   └── refresh.ts         ⭐ 핵심 — refreshToken 기반 토큰 재발급
│   │   └── tokens.ts              ⭐ 핵심 — 로그아웃 및 토큰 쿠키 제거
│   └── index.tsx

```

### 설계 의도

- Q : 왜 401 발생 시 요청을 queue에 보관하였는가?

accessToken 만료 상황에서 여러 API 요청이 동시에 401 에러를 반환할 수 있다.
이때 각 요청이 개별적으로 refreshToken API를 호출하면 중복 호출, 토큰 불일치 등 인증 흐름이 불안정해질 수 있다.

이를 방지하기 위해 401 에러가 발생한 요청을 queue에 보관한 뒤,
최초 401 발생 시에만 refreshToken API를 호출하여 accessToken을 재발급한다.
토큰 갱신이 완료되면 queue에 보관된 모든 요청을 최신 accessToken으로 다시 요청한다.

이 구조를 통해 refreshToken 호출을 단일화하고,
API동시요청 환경에서도 모든 API요청이 동일한 최신 accessToken을 사용할 수 있도록 보장할 수 있다.

### 핵심 논리

- axios 환경에서 리프레시토큰 기반 인증 로직을 직접 추상화하여 인증 인터셉터 구현

accessToken 만료로 여러 API 요청에서 401 에러 발생</br>
-> 401 에러가 발생한 요청들을 내부 queue에 저장</br>
-> 최초 401 발생 시 refreshToken API 호출하여 accessToken 재발급</br>
-> 토큰 갱신 완료 후 queue에 저장된 요청들을 다시 재요청</br>
-> 모든 API 요청이 정상 응답으로 복구되는 것을 확인</br>
