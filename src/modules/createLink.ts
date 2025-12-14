import { onError } from "@apollo/client/link/error";
import {
  ApolloLink,
  FetchResult,
  HttpLink,
  Observable,
  ObservableSubscription,
} from "@apollo/client";
import { RefreshTokenAdapter } from "./refreshTokenAdapter";
import { getRestoreAuthToken } from "./getRestoreAuthToken";

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

  const errorLink = onError(
    ({ forward, operation, networkError }): Observable<FetchResult> | void => {
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
    }
  );

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

  return ApolloLink.from([errorLink, httpLink]);
};
