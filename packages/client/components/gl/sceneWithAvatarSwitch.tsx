import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import {
  addComponent,
  createEntity,
  getComponent,
  getMutableComponent
} from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { NetworkSchema } from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { staticWorldColliders } from "@xr3ngine/engine/src/templates/car/prefabs/staticWorldColliders";
import { PlayerCharacter } from '@xr3ngine/engine/src/templates/character/prefabs/PlayerCharacter';
import { DefaultNetworkSchema } from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import React, { FunctionComponent, useEffect, useState, CSSProperties } from 'react';
import {
  AmbientLight,
  EquirectangularReflectionMapping,
  sRGBEncoding,
  TextureLoader,
  PointLight, Vector3, Quaternion
} from "three";
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';
import { interactiveBox } from "../../../engine/src/templates/interactive/prefabs/interactiveBox";
import { CharacterAvatars } from "../../../engine/src/templates/character/CharacterAvatars";
import { setActorAvatar } from "../../../engine/src/templates/character/behaviors/setActorAvatar";
import { CharacterAvatarComponent } from "../../../engine/src/templates/character/components/CharacterAvatarComponent";

export const EnginePage: FunctionComponent = (props: any) => {
  const [actorEntity, setActorEntity] = useState(null);
  const [actorAvatarId, setActorAvatarId] = useState('Rose');

  useEffect(() => {
    console.log('initializeEngine!');

    const networkSchema: NetworkSchema = {
      ...DefaultNetworkSchema,
      transport: SocketWebRTCClientTransport
    };

    const InitializationOptions = {
      ...DefaultInitializationOptions,
      networking: {
        enabled: false,
        supportsMediaStreams: true,
        schema: networkSchema
      },
      physics: {
        enabled: true
      },
      audio: {
        src: '/audio/djMagda.m4a'
      },
      input: {
        mobile: false
      }
    };
    initializeEngine(InitializationOptions);

    // Load glb here
    // createPrefab(rigidBodyBox);

    addObject3DComponent(createEntity(), {
      obj3d: AmbientLight, ob3dArgs: {
        intensity: 1
      }
    });
    const le = createEntity();
    addComponent(le, TransformComponent, {
      position: new Vector3(-4, 3, -3),
      rotation: new Quaternion(0, 0, 0),
      velocity: new Vector3(0, 0, 0)
    });
    addObject3DComponent(le, {
      obj3d: PointLight, ob3dArgs: {
        intensity: 1
      }
    });

    const cameraTransform = getMutableComponent<TransformComponent>(CameraComponent.instance.entity, TransformComponent);
    cameraTransform.position.set(0, 1.2, 3);

    const envMapURL =
      "./hdr/city.jpg";

    const loader = new TextureLoader();

    (loader as any).load(envMapURL, data => {
      const map = loader.load(envMapURL);
      map.mapping = EquirectangularReflectionMapping;
      map.encoding = sRGBEncoding;
      Engine.scene.environment = map;
      Engine.scene.background = map;
    }, null);

    createPrefab(staticWorldColliders);
    createPrefab(interactiveBox);

    const actorEntity = createPrefab(PlayerCharacter);
    setActorEntity(actorEntity);


    return (): void => {
      // cleanup
      console.log('cleanup?!');
      // TODO: use resetEngine when it will be completed. for now just reload
      if (confirm('hot update! do cleanup/reload?')) {
        document.location.reload();
      } else {
        // resetEngine();
      }
    };
  }, []);

  useEffect(() => {
    if (actorEntity) {
      setActorAvatar(actorEntity, {avatarId: actorAvatarId});
    }
  }, [ actorEntity, actorAvatarId ]);

  let avatarSelect = null;
  if (actorEntity) {
    const avatarId = getComponent(actorEntity, CharacterAvatarComponent)?.avatarId;
    let currentAvatarIndex = CharacterAvatars.findIndex(value => value.id === avatarId);
    if (currentAvatarIndex === -1) {
      currentAvatarIndex = 0;
    }
    const nextAvatarIndex = (currentAvatarIndex + 1) % CharacterAvatars.length;
    let prevAvatarIndex = (currentAvatarIndex - 1) % CharacterAvatars.length;
    if (prevAvatarIndex < 0) {
      prevAvatarIndex = CharacterAvatars.length - 1;
    }
    const nextAvatarId = CharacterAvatars[nextAvatarIndex].id;
    const prevAvatarId = CharacterAvatars[prevAvatarIndex].id;
    console.log('currentAvatarIndex', currentAvatarIndex);
    console.log('nextAvatar', nextAvatarIndex, nextAvatarId);
    console.log('prevAvatar', prevAvatarIndex, prevAvatarId);

    avatarSelect = (<div style={{ position: 'fixed', zIndex: 9999}}>
      <button type={"button"} onClick={(): void => setActorAvatarId(prevAvatarId) }>prev</button>
      <button type={"button"} onClick={(): void => setActorAvatarId(nextAvatarId) }>next</button>
    </div>);
  }

  return (
    <>
      {avatarSelect}
    </>
  );
};

export default EnginePage;
