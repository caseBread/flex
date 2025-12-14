import { onError } from "@apollo/client/link/error";
import {
  ApolloLink,
  HttpLink,
  Observable,
  ObservableSubscription,
} from "@apollo/client";
import { createPersistedQueryLink } from "@apollo/client/link/persisted-queries";
import { sha256 } from "crypto-hash";
import { RefreshTokenAdapter } from "./refreshTokenAdapter";
import { CLIENT_BASE_URL } from "@/constants/URL";

const getRestoreAuthToken = async (): Promise<{
  accessToken: string;
}> => {
  const response = await fetch(`${CLIENT_BASE_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
  });

  const { accessToken: newAccessToken } = await response.json();

  if (!newAccessToken) {
    throw new Error("로그아웃");
  }

  return { accessToken: newAccessToken };
};

type CreateLink = {
  apiBaseUrl: string;
  clientBaseUrl: string;
  cookies: Record<string, string>;
};

export const createLink = ({
  apiBaseUrl,
  clientBaseUrl,
  cookies,
}: CreateLink): ApolloLink => {
  const refreshTokenAdapter = new RefreshTokenAdapter<
    void,
    { accessToken: string }
  >({
    refreshTokenFetcher: getRestoreAuthToken,
  });

  const errorLink = onError(({ forward, operation, networkError }) => {
    if (
      networkError &&
      "statusCode" in networkError &&
      networkError.statusCode === 401
    ) {
      return new Observable((observer) => {
        let subscription: ObservableSubscription;

        void refreshTokenAdapter
          .getRefreshedAccessToken()
          .then(async (response) => {
            operation.setContext({
              headers: {
                ...operation.getContext().headers,
                Authorization: `Bearer ${response.accessToken}`,
              },
            });
          })
          .catch(async (err) => {
            if (typeof window !== "undefined") {
              // 로그인토큰을 쿠키에서 삭제
              await fetch(`${clientBaseUrl}/api/tokens`, {
                method: "DELETE",
                headers: {
                  "content-type": "application/json",
                },
              });
            }

            operation.setContext({
              headers: {
                ...operation.getContext().headers,
                Authorization: ``,
              },
            });
          })
          .finally(() => {
            const subscriber = {
              next: observer.next.bind(observer),
              error: observer.error.bind(observer),
              complete: observer.complete.bind(observer),
            };

            subscription = forward(operation).subscribe(subscriber);
          });

        return () => subscription.unsubscribe();
      });
    }
  });

  const httpLink = new HttpLink({
    uri: `${apiBaseUrl}/api/graphql`,
    credentials: "include",
    headers: {
      ...(cookies.accessToken && {
        Authorization: `Bearer ${cookies.accessToken}`,
      }),
      "content-type": "application/json",
    },
  });

  const persistedQueryLink = createPersistedQueryLink({
    useGETForHashedQueries: true, // Q : 무슨코드? A : 네트워크비용 줄이기위해 쿼리를 해시로 바꾸는 코드다.
    sha256: sha256,
  });

  return ApolloLink.from([persistedQueryLink, errorLink, httpLink]);
};
