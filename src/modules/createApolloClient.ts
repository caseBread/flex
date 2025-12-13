import { ApolloClient, InMemoryCache } from "@apollo/client";
import { createLink } from "./createLink";
import { API_BASE_URL, CLIENT_BASE_URL } from "@/constants/URL";

type CreateApolloClient = {
  cookies: Record<string, string>;
};

const createApolloClient = ({ cookies }: CreateApolloClient) => {
  const link = createLink({
    apiBaseUrl: API_BASE_URL,
    clientBaseUrl: CLIENT_BASE_URL,
    cookies,
  });

  const cache = new InMemoryCache();

  const client = new ApolloClient({
    ssrMode: typeof window === "undefined",
    link,
    cache,
  });

  return client;
};

export default createApolloClient;
