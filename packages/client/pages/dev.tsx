import DebugScene from '@xr3ngine/client-core/components/scenes/debug';
import Loading from '@xr3ngine/client-core/components/scenes/loading';
import Layout from '@xr3ngine/client-core/components/ui/Layout/OverlayLayout';
import React from 'react';
import NoSSR from 'react-no-ssr';

const LocationPage = () => {
  return (
    <Layout pageTitle="Home">
      <NoSSR onSSR={<Loading />}>
      <DebugScene locationName="test"/>
      </NoSSR>
    </Layout>
  );
};

export default LocationPage;