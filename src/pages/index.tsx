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
  const q1 = useQuery(Q_IS_LOGINED, { fetchPolicy: "no-cache" });
  const q2 = useQuery(Q_USER_ID, { fetchPolicy: "no-cache" });
  const q3 = useQuery(Q_ROLE, { fetchPolicy: "no-cache" });

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

  const loading = q1.loading || q2.loading || q3.loading;
  const error = q1.error || q2.error || q3.error;

  const test = {
    isLogined: q1.data?.test?.isLogined,
    userId: q2.data?.test?.userId,
    role: q3.data?.test?.role,
  };

  return (
    <main>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>GraphQL Error: {error.message}</p>
      ) : (
        <>
          <p>isLogined: {String(test.isLogined)}</p>
          <p>userId: {String(test.userId)}</p>
          <p>role: {String(test.role)}</p>
        </>
      )}

      <button
        onClick={handleLogin}
        style={{ marginTop: 12, padding: "6px 12px" }}
      >
        로그인 (토큰 발급)
      </button>
      <button
        onClick={handleLogout}
        style={{ marginTop: 12, padding: "6px 12px" }}
      >
        로그아웃 (토큰 삭제)
      </button>
    </main>
  );
}
