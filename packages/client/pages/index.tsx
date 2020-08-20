import React from 'react';
import NoSSR from 'react-no-ssr';

import Scene from "../components/gl/scene";
import Loading from '../components/gl/loading';
import Layout from '../components/ui/Layout';
export const IndexPage = (): any => {
  return(
    <Layout pageTitle="Home">
      <NoSSR onSSR={<Loading/>}>
        <Scene />
      </NoSSR>
    </Layout>
  );
};

export default IndexPage;
