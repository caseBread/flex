import { AppProps } from "next/app";
import { useApollo } from "../modules/apolloClient";
import { ApolloProvider } from "@apollo/client";

const CustomApp = ({ Component, pageProps }: AppProps) => {
  const { client: apolloClient } = useApollo({
    pageProps,
  });

  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
};

export default CustomApp;
