import { OfflineEnginePage } from '../components/Scene/offlineLocation';
import React from 'react';

const LocationPage = (props) => {
  return (
    <>
      <video id="video360" style={{display:'none'}} controls autoPlay>
        <source src="https://archive.org/download/BigBuckBunny_124/Content/big_buck_bunny_720p_surround.mp4" type="video/mp4"/>
          Your browser does not support the video tag.
      </video>

      <OfflineEnginePage locationName={props.match.params.locationName}/>
    </>
  );
};

export default LocationPage;