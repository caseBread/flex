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
    await fetch("/api/auth/login", {
      method: "POST",
    });

    window.location.reload();
  };

  const handleLogout = async (): Promise<void> => {
    await fetch(`${CLIENT_BASE_URL}/api/tokens`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
      },
    });

    window.location.reload();
  };

  const handleCorruptAccessToken = () => {
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
        <p>GraphQL Error: {error.message}</p>
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

      <button
        onClick={handleLogin}
        style={{ marginTop: 12, marginRight: 8, padding: "6px 12px" }}
      >
        로그인 (토큰 발급)
      </button>
      <button
        onClick={handleLogout}
        style={{ marginTop: 12, marginRight: 8, padding: "6px 12px" }}
      >
        로그아웃 (토큰 삭제)
      </button>
      <button
        onClick={handleCorruptAccessToken}
        style={{ marginTop: 12, marginRight: 8, padding: "6px 12px" }}
      >
        accessToken 만료시키기
      </button>
    </main>
  );
}
