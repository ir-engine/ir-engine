import React, { Component, useEffect, FunctionComponent, useState } from 'react';
import { initializeEngine, DefaultInitializationOptions } from "@xr3ngine/engine/src/initialize";
import { PlayerController } from "../gl/PlayerController";
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/networking/defaults/DefaultNetworkSchema';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import Terminal from '../terminal';
import { commands, description } from '../terminal/commands';
export const EnginePage: FunctionComponent = (props: any) => {


  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const networkSchema: NetworkSchema = {
      ...DefaultNetworkSchema,
      transport: SocketWebRTCClientTransport
    }

    const InitializationOptions = {
      ...DefaultInitializationOptions,
      networking: {
        enabled: true,
        supportsMediaStreams: true,
        schema: networkSchema
      },
    };
    initializeEngine(InitializationOptions);

    // Load glb here

    createPrefab(PlayerController);
  }, [])

  useEffect(() => {
    const f = event => {
      if (event.keyCode === 27)
        toggleEnabled();
    }
    document.addEventListener("keydown", f);
    return () => {
      document.removeEventListener("keydown", f);
    };
  });

  const toggleEnabled = () => {
    console.log("enabled ", enabled)
    if (enabled === true) {
      setEnabled(false)
    } else {
      setEnabled(true)
    }
  }

  return (
    enabled && (
      <Terminal
        color='green'
        backgroundColor='black'
          allowTabs= { false }
          startState='maximised'
          showCommands={true}
        style={{ fontWeight: "bold", fontSize: "1em", position: "fixed", bottom: "0", width: "100%", height: "30%", zIndex: 4000 }}
        commands={commands}
        description={description}
        msg='Interactive terminal. Please consult the manual for commands.'
      />
    )
  )
};

export default EnginePage;
