import App, { AppContext, AppInitialProps, AppProps } from "next/app";
import { useApollo } from "../modules/apolloClient";
import { ApolloProvider } from "@apollo/client";

const CustomApp = (
  appProps: {
    currentHost: string;
  } & AppProps
) => {
  const { Component, pageProps } = appProps;

  const { client: apolloClient } = useApollo({
    pageProps,
  });

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};

CustomApp.getInitialProps = async (
  appContext: AppContext
): Promise<AppInitialProps | {}> => {
  const pageGetInitialProps = await App.getInitialProps(appContext);

  return {
    ...pageGetInitialProps,
  };
};

export default CustomApp;
