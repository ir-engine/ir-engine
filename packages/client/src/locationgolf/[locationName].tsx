import Loading from '../components/Scene/loading';
import Scene from '../components/Scene/golf';
import Layout from '../components/Layout/Layout';
import useRouter from 'next/router';
import React from 'react';
import NoSSR from 'react-no-ssr';
import { useTranslation } from 'react-i18next';

const LocationPage = () => {
  const { t } = useTranslation();
  const { locationName } = useRouter().query as any;
  return (
    <Layout pageTitle={t('location.locationName.pageTitle')}>
      <NoSSR onSSR={<Loading />}>
      <Scene locationName={locationName}/>
      </NoSSR>
    </Layout>
  );
};

export default LocationPage;