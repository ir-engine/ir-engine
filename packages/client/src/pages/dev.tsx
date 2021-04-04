import DebugScene from '../components/Scene/debug';
import Loading from '@xr3ngine/client/components/Scene/loading';
import Layout from '@xr3ngine/client/components/Layout/Layout';
import React from 'react';
import NoSSR from 'react-no-ssr';
import { useTranslation } from 'react-i18next';

const LocationPage = () => {
  const { t } = useTranslation();
  return (
    <Layout pageTitle={t('dev.pageTitle')}>
      <NoSSR onSSR={<Loading />}>
      <DebugScene locationName="test"/>
      </NoSSR>
    </Layout>
  );
};

export default LocationPage;