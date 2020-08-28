import React, { Component, useEffect, FunctionComponent, useState } from 'react';
import { initializeEngine, DefaultInitializationOptions } from "@xr3ngine/engine/src/initialize";
import { PlayerCharacter } from "@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacter";
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import Terminal from '../terminal';
import { commands, description } from '../terminal/commands';
import { createEntity, addComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { AssetLoader } from "@xr3ngine/engine/src/assets/components/AssetLoader"
import { AssetType } from '@xr3ngine/engine/src/assets/enums/AssetType';
import { AssetClass } from '@xr3ngine/engine/src/assets/enums/AssetClass';

import { staticWorldColliders } from './staticWorldColliders'
import { rigidBodyBox } from './rigidBodyBox'
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
import { AmbientLight, Color } from 'three';
import { PositionalAudio, Mesh, SphereBufferGeometry, MeshPhongMaterial  } from 'three';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/network/DefaultNetworkSchema';
import { resetEngine } from '@xr3ngine/engine/src/ecs/functions/EngineFunctions';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { Body, Shape } from "cannon-es"
import debug from "cannon-es-debugger"
import { PhysicsManager } from '@xr3ngine/engine/src/physics/components/PhysicsManager';

export const EnginePage: FunctionComponent = (props: any) => {

  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    console.log('initializeEngine!');

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
      },
      audio: {
        src: '/audio/djMagda.m4a'
      },
    };
    initializeEngine(InitializationOptions);

    // Load glb here
    // createPrefab(rigidBodyBox);
    
    createPrefab(staticWorldColliders);
    // createPrefab(PlayerCharacter);
    

    
    addObject3DComponent(createEntity(), { obj3d: AmbientLight, ob3dArgs: {
      intensity: 2.0
    }})
    
    const cameraTransform = getMutableComponent<TransformComponent>(CameraComponent.instance.entity, TransformComponent)

    cameraTransform.position.set(0, 1.2, 5)


    const {sound} = Engine as any;
    if( sound ){
      const audioMesh = new Mesh(
        new SphereBufferGeometry( 1, 1, 1 ),
        new MeshPhongMaterial({ color: 0xff2200 })
      );
      const entity = createEntity()
      addObject3DComponent(entity, { 
        obj3d: audioMesh
      });
const transform = addComponent<TransformComponent>(entity, TransformComponent) as any
transform.position.set(0,0,0)
      audioMesh.add( sound );
    }
   
    //    console.log("Creating a scene entity to test")
    // addComponent(createEntity(), AssetLoader, {
    //   url: "models/library.glb",
    //   receiveShadow: true,
    //   castShadow: true
    // }) 
    // addComponent(createEntity(), AssetLoader, {
    //   url: "models/OldCar.fbx",
    //   receiveShadow: true,
    //   castShadow: true
    // })

    return () => {
      // cleanup
      console.log('cleanup?!')
      resetEngine()
    }
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
