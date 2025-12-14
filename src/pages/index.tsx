import { GetServerSidePropsContext } from "next";
import { getCommonServerSideProps } from "@/modules/serverSideProps";
import { addApolloState } from "@/modules/apolloClient";
import gql from "graphql-tag";
import { useApolloClient, useQuery } from "@apollo/client";

export const document = gql`
  query GetIsLogined {
    test {
      isLogined
    }
  }
`;

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { apolloClient } = await getCommonServerSideProps(ctx);

  const originPageProps = {
    props: {},
  };

  return addApolloState(apolloClient, originPageProps);
};

export default function Home() {
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery(document);

  const login = async () => {
    await fetch("/api/auth/login", {
      method: "POST",
    });

    await client.reFetchObservableQueries();
  };

  if (loading) return <main>Loading...</main>;
  if (error) return <main>401 or GraphQL Error: {error.message}</main>;

  return (
    <main>
      <p>isLogined: {String(data?.test?.isLogined)}</p>

      <button onClick={login} style={{ marginTop: 12, padding: "6px 12px" }}>
        로그인 (토큰 발급)
      </button>
    </main>
  );
}
