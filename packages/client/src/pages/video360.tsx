import Loading from '../components/Scene/loading';
import { OfflineEnginePage } from '../components/Scene/offlineLocation';
import { useRouter } from 'next/router';
import React from 'react';
import NoSSR from 'react-no-ssr';

const LocationPage = () => {
  const { locationName } = useRouter().query as any;
  return (
    <NoSSR onSSR={<Loading />}>

    <video id="video360" style={{display:'none'}} controls autoPlay>
      <source src="https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4" type="video/mp4"/>
        Your browser does not support the video tag.
    </video>
      
      <OfflineEnginePage locationName={locationName}/>
    </NoSSR>
  );
};

export default LocationPage;