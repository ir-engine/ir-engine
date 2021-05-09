import { VUSR360PlayerPage } from '../components/Scene/vusr';
import React from 'react';

const LocationPage = (props) => {
  return (
    <>
      <VUSR360PlayerPage locationName={props.match.params.locationName}/>
    </>
  );
};

export default LocationPage;