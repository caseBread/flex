import { GetServerSidePropsContext } from "next";
import { getCommonServerSideProps } from "@/modules/serverSideProps";
import { addApolloState } from "@/modules/apolloClient";

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const { apolloClient } = await getCommonServerSideProps(ctx);

  const originPageProps = {
    props: {},
  };

  return addApolloState(apolloClient, originPageProps);
};

export default function Home() {
  return (
    <>
      <main>Hello World!</main>
    </>
  );
}
