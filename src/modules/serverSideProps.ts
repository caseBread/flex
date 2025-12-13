import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { GetServerSidePropsContext } from "next";
import { parseCookies } from "nookies";
import { getApolloClient } from "./apolloClient";

export const getCommonServerSideProps = async (
  ctx: GetServerSidePropsContext
): Promise<{
  apolloClient: ApolloClient<NormalizedCacheObject>;
}> => {
  const cookies = parseCookies(ctx);

  const client = getApolloClient({ serverCookies: cookies });

  return {
    apolloClient: client,
  };
};
