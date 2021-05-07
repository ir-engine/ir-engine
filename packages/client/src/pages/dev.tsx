import { DefaultInitializationOptions } from '@xrengine/engine/src/DefaultInitializationOptions';
import { initializeEngine } from '@xrengine/engine/src/initialize';
import React, { useEffect } from 'react';

const LocationPage = () => {
  useEffect(() => {

    const InitializationOptions = {
      ...DefaultInitializationOptions,
      offline: true
    };

    initializeEngine(InitializationOptions);
  }, []);

  return (
    <>
    </>
  );
};

export default LocationPage;