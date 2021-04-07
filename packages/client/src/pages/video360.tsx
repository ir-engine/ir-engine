import Loading from '../components/Scene/loading';
import { OfflineEnginePage } from '../components/Scene/offlineLocation';
import { useRouter } from 'next/router';
import React from 'react';
import NoSSR from 'react-no-ssr';

//
//  loop muted crossOrigin="anonymous" playsinline style="display:none"
const LocationPage = () => {
  const { locationName } = useRouter().query as any;
  return (
    <NoSSR onSSR={<Loading />}>
      {<video id="video"
          src="https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4"
          width="640"
          >
      </video>}
      <OfflineEnginePage locationName={locationName}/>
    </NoSSR>
  );
};

export default LocationPage;