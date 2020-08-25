import React, { Component, useEffect, FunctionComponent, useState } from 'react';
import { initializeEngine, DefaultInitializationOptions } from "@xr3ngine/engine/src/initialize";
import { PlayerCharacter } from "@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacter";
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import Terminal from '../terminal';
import { commands, description } from '../terminal/commands';
import { createEntity, addComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { AssetLoader } from "@xr3ngine/engine/src/assets/components/AssetLoader"
import { AssetType } from '@xr3ngine/engine/src/assets/enums/AssetType';
import { AssetClass } from '@xr3ngine/engine/src/assets/enums/AssetClass';

import { staticWorldColliders } from './staticWorldColliders'
import { rigidBodyBox } from './rigidBodyBox'
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
import { AmbientLight } from 'three';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/network/DefaultNetworkSchema';

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
      physics: {
        enabled: true
      }
    };
    initializeEngine(InitializationOptions);

    // Load glb here
    createPrefab(rigidBodyBox);

    createPrefab(PlayerCharacter);

     createPrefab(staticWorldColliders);

    addObject3DComponent(createEntity(), { obj3d: AmbientLight, ob3dArgs: {
      intensity: 2.0
    }})

    console.log("Creating a scene entity to test")
    addComponent(createEntity(), AssetLoader, {
      assetType: AssetType.glTF,
      assetClass: AssetClass.Model,
      url: "models/library.glb",
      receiveShadow: true,
      castShadow: true
    }) 
    addComponent(createEntity(), AssetLoader, {
      assetType: AssetType.FBX,
      assetClass: AssetClass.Model,
      url: "models/OldCar.fbx",
      receiveShadow: true,
      castShadow: true
    }) 
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
        allowTabs={false}
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
