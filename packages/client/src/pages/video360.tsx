import { OfflineEnginePage } from '../components/Scene/offlineLocation';
import React from 'react';

const LocationPage = (props) => {
  return (
    <>
      <OfflineEnginePage locationName={props.match.params.locationName}/>
    </>
  );
};

export default LocationPage;