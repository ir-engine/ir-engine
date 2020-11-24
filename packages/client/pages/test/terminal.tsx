import React from 'react';
import Layout from '../../components/ui/Layout';
import Terminal from '../../components/terminal';
import Scene  from '../scene/mvp';

export const IndexPage = (props: any): any => {
 
  return(
    <Layout pageTitle="Home">
      <Scene />
      <Terminal />
    </Layout>
  );
};

export default IndexPage;
