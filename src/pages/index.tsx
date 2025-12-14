/**
 * accessToken / refreshToken 동작 테스트 페이지
 *
 * 이 페이지는 accessToken / refreshToken 기반 인증 플로우가
 * 정상적으로 동작하는지 수동으로 검증하기 위한 테스트용 페이지입니다.
 *
 * ─────────────────────────────────────────────
 * 상단 상태 값 (isLogined / userId / role)
 *
 * 페이지 상단에 표시되는 세 가지 값은 각각 서로 다른 GraphQL API를 호출하며,
 * 하나의 페이지에서 여러 개의 API 요청이 동시에 발생하는 상황을 가정합니다.
 *
 * 이를 통해 다음과 같은 시나리오를 테스트합니다.
 * - 여러 API 요청 중 accessToken이 만료된 경우
 * - refreshToken을 통해 accessToken이 재발급될 때
 * - 모든 API 요청이 정상적으로 복구되는지 여부
 *
 * 즉, 단일 요청이 아닌 "동시 다발적인 API 호출 환경"에서의
 * 인증/토큰 갱신 동작을 검증하기 위한 구조입니다.
 *
 * ─────────────────────────────────────────────
 * 테스트 버튼 설명 (총 3개)
 *
 * 1. 로그인 (토큰 발급)
 *    - 로그인 API를 호출하여
 *    - 새로운 accessToken / refreshToken을 발급받습니다.
 *
 * 2. 로그아웃 (토큰 삭제)
 *    - accessToken / refreshToken 쿠키를 모두 삭제하여
 *    - 완전한 로그아웃 상태를 만듭니다.
 *
 * 3. accessToken 만료
 *    - accessToken 쿠키만 의도적으로 깨뜨려 만료 상태를 만들고
 *    - refreshToken을 통해 accessToken / refreshToken이
 *      정상적으로 재발급(갱신)되는지 확인합니다.
 *
 */

import { GetServerSideProps } from "next";
import { getCommonServerSideProps } from "@/modules/serverSideProps";
import { addApolloState } from "@/modules/apolloClient";
import gql from "graphql-tag";
import { useQuery } from "@apollo/client";
import { CLIENT_BASE_URL } from "@/constants/URL";

export const Q_IS_LOGINED = gql`
  query GetIsLogined {
    test {
      isLogined
    }
  }
`;

export const Q_USER_ID = gql`
  query GetUserId {
    test {
      userId
    }
  }
`;

export const Q_ROLE = gql`
  query GetRole {
    test {
      role
    }
  }
`;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { apolloClient } = await getCommonServerSideProps(ctx);

  const originPageProps = {
    props: {},
  };

  return addApolloState(apolloClient, originPageProps);
};

export default function Home() {
  const testQuery1 = useQuery(Q_IS_LOGINED, { fetchPolicy: "no-cache" });
  const testQuery2 = useQuery(Q_USER_ID, { fetchPolicy: "no-cache" });
  const testQuery3 = useQuery(Q_ROLE, { fetchPolicy: "no-cache" });

  const handleLogin = async (): Promise<void> => {
    await fetch(`${CLIENT_BASE_URL}/api/auth/login`, {
      method: "POST",
    });

    window.location.reload();
  };

  const handleLogout = async (): Promise<void> => {
    await fetch(`${CLIENT_BASE_URL}/api/tokens`, {
      method: "DELETE",
    });

    window.location.reload();
  };

  const handleCorruptAccessToken = (): void => {
    document.cookie =
      "accessToken=EXPIRED.INVALID.TOKEN; Path=/; SameSite=Lax;";

    window.location.reload();
  };

  const loading =
    testQuery1.loading || testQuery2.loading || testQuery3.loading;
  const error = testQuery1.error || testQuery2.error || testQuery3.error;

  const test = {
    isLogined: testQuery1.data?.test?.isLogined,
    userId: testQuery2.data?.test?.userId,
    role: testQuery3.data?.test?.role,
  };

  return (
    <main>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <>
          <p>
            isLogined:
            <span style={{ color: !test.isLogined ? "red" : "green" }}>
              {String(test.isLogined)}
            </span>
          </p>
          <p>
            userId:
            <span style={{ color: !test.userId ? "red" : "green" }}>
              {String(test.userId)}
            </span>
          </p>
          <p>
            role:
            <span style={{ color: !test.role ? "red" : "green" }}>
              {String(test.role)}
            </span>
          </p>
        </>
      )}

      <fieldset
        style={{
          marginTop: 48,
          padding: 16,
          border: "1px solid #ccc",
          borderRadius: 8,
        }}
      >
        <legend
          style={{
            padding: "0 8px",
            fontWeight: 600,
          }}
        >
          테스트 버튼
        </legend>

        <button
          onClick={handleLogin}
          style={{ marginRight: 8, padding: "6px 12px" }}
        >
          로그인 (토큰 발급)
        </button>

        <button
          onClick={handleLogout}
          style={{ marginRight: 8, padding: "6px 12px" }}
        >
          로그아웃 (토큰 삭제)
        </button>

        <button
          onClick={handleCorruptAccessToken}
          style={{ padding: "6px 12px" }}
        >
          accessToken 만료
        </button>
      </fieldset>
    </main>
  );
}
