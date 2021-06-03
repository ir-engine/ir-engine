import { initializeEngine } from '@xrengine/engine/src/initializeEngine';
import { CharacterInputSchema } from '@xrengine/engine/src/character/CharacterInputSchema';
import React, { useEffect } from 'react';

const LocationPage = () => {
  useEffect(() => {


    const InitializationOptions = {
      input: {
        schema: CharacterInputSchema,
      },
      networking: {
        publicPath: '',
        useOfflineMode: true,
      },
      renderer: {
        disabled: true,
        postProcessing: false,
      }
    };

    initializeEngine(InitializationOptions);
  }, []);

  return (
    <>
    </>
  );
};

export default LocationPage;