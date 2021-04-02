import Loading from '@xr3ngine/client-core/components/scenes/loading';
import Scene from '../../components/Scene/location';
import Layout from '@xr3ngine/client-core/components/ui/Layout/OverlayLayout';
import { useRouter } from 'next/router';
import React from 'react';
import NoSSR from 'react-no-ssr';

const LocationPage = () => {
  const { locationName } = useRouter().query as any;
  return (
    <Layout pageTitle="Home">
      <NoSSR onSSR={<Loading />}>
      <Scene locationName={locationName}/>
      </NoSSR>
    </Layout>
  );
};

export default LocationPage;