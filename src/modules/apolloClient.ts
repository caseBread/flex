import { ApolloClient, NormalizedCacheObject } from "@apollo/client";
import { useMemo } from "react";
import createApolloClient from "./createApolloClient";
import { mergeApolloCache } from "./mergeApolloCache";
import nookies from "nookies";

const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";

let CLIENT: ApolloClient<NormalizedCacheObject> | null = null;
const isServer = typeof window === "undefined";

type GetApolloClient = {
  serverCookies?: Record<string, string>;
  apolloState?: NormalizedCacheObject;
};
export function getApolloClient({
  serverCookies,
  apolloState,
}: GetApolloClient): ApolloClient<NormalizedCacheObject> {
  if (isServer) {
    // 서버에서는 전역변수를 절대 활용하면 안됨. 동시성 이슈가 생길 수 있다.
    const serverClient = createApolloClient({
      cookies: serverCookies ?? {},
    });

    if (apolloState) {
      const currentCache = serverClient.cache.extract();
      const mergedCache = mergeApolloCache(currentCache, apolloState);
      serverClient.cache.restore(mergedCache);
    }

    return serverClient;
  }

  if (CLIENT === null) {
    const cookies = typeof window !== "undefined" ? nookies.get() : {};

    CLIENT = createApolloClient({
      cookies,
    });
  }

  if (apolloState) {
    const currentCache = CLIENT.cache.extract();
    const mergedCache = mergeApolloCache(currentCache, apolloState);
    CLIENT.cache.restore(mergedCache);
  }

  return CLIENT;
}

/** ssr에서 fetch된 결과를 client에 hydrate하기 위해 필요한 함수 (in pages) */
export const addApolloState = <T>(
  client: ApolloClient<NormalizedCacheObject>,
  pageProps: Record<string, T>
) => {
  const resultPageProps = {
    ...pageProps,
    props: {
      ...pageProps?.props,
      [APOLLO_STATE_PROP_NAME]: client.cache.extract(),
    },
  };

  return resultPageProps;
};

export const useApollo = ({
  pageProps,
}: {
  pageProps: Record<string, any>;
}) => {
  const state = pageProps?.[APOLLO_STATE_PROP_NAME];

  const client = useMemo(
    () =>
      getApolloClient({
        apolloState: state,
      }),
    [state]
  );

  return { client };
};
