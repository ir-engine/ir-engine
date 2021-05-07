import { initializeEngine } from '@xrengine/engine/src/initialize';
import { CharacterInputSchema } from '@xrengine/engine/src/templates/character/CharacterInputSchema';
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