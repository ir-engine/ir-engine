import { initializeEngine } from '@xrengine/client-core/src/initialize';
import { CharacterInputSchema } from '@xrengine/engine/src/character/CharacterInputSchema';
import React, { useEffect } from 'react';

const LocationPage = () => {
  useEffect(() => {


    const InitializationOptions = {
      input: {
        schema: CharacterInputSchema,
      },
      publicPath: '',
      useOfflineMode: true,
      useCanvas: false,
      postProcessing: false
    };

    initializeEngine(InitializationOptions);
  }, []);

  return (
    <>
    </>
  );
};

export default LocationPage;