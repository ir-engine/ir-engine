import React, { useEffect } from 'react';
import { initializeEngine, DefaultInitializationOptions } from "@xr3ngine/engine/src/initialize";
import { PlayerController } from "../gl_examples/PlayerController";
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/networking/defaults/DefaultNetworkSchema';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';

export const EnginePage = (): any => {
  useEffect(() => {
    const networkSchema: NetworkSchema = {
      ...DefaultNetworkSchema,
      transport: SocketWebRTCClientTransport
    }

    console.log("Network Schema: ")
    console.log(networkSchema)

    const InitializationOptions = {
      ...DefaultInitializationOptions,
      networking: {
        ...DefaultInitializationOptions.networking,
        schema: networkSchema
      },
    };
    initializeEngine(InitializationOptions);
    

    createPrefab(PlayerController);
  },[]);
  return null
};

export default EnginePage;
