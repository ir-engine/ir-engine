import Loading from '@xr3ngine/client-core/components/scenes/loading';
import { OfflineEnginePage } from '@xr3ngine/client-core/components/scenes/offlineLocation';
import { useRouter } from 'next/router';
import React from 'react';
import NoSSR from 'react-no-ssr';

const LocationPage = () => {
  const { locationName } = useRouter().query as any;
  return (
    <NoSSR onSSR={<Loading />}>
      <OfflineEnginePage locationName={locationName}/>
    </NoSSR>
  );
};

export default LocationPage;