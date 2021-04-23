import DebugScene from '../components/Scene/debug';
import Layout from '../components/Layout/Layout';
import React from 'react';
import { useTranslation } from 'react-i18next';
const LocationPage = () => {
  const { t } = useTranslation();
  return (
    <Layout pageTitle={t('dev.pageTitle')}>
      <DebugScene locationName="test"/>
    </Layout>
  );
};

export default LocationPage;