import React from 'react';
import Layout from '../components/ui/Layout';
import Terminal from '../components/terminal';

export const IndexPage = (props: any): any => {
 
  return(
    <Layout pageTitle="Home">
      <Terminal />
    </Layout>
  );
};

export default IndexPage;
