import Loading from '../components/Scene/loading';
import { OfflineEnginePage } from '../components/Scene/offlineLocation';
import { useRouter } from 'next/router';
import React from 'react';
import NoSSR from 'react-no-ssr';

const LocationPage = () => {
  const { locationName } = useRouter().query as any;
  return (
    <NoSSR onSSR={<Loading />}>

    <div id="video360" style={{display:'none'}}/>      
      <OfflineEnginePage locationName={locationName}/>
    </NoSSR>
  );
};

export default LocationPage;