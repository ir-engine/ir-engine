import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { addObject3DComponent } from '@xr3ngine/engine/src/common/behaviors/Object3DBehaviors';
import { createPrefab } from '@xr3ngine/engine/src/common/functions/createPrefab';
import {
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
import React, { FunctionComponent, useEffect, useState } from 'react';
import {
  AmbientLight
} from "three";
import { setActorAvatar } from "@xr3ngine/engine/src/templates/character/behaviors/setActorAvatar";
import { CharacterAvatars } from "@xr3ngine/engine/src/templates/character/CharacterAvatars";
import { CharacterAvatarComponent } from "@xr3ngine/engine/src/templates/character/components/CharacterAvatarComponent";
import { SocketWebRTCClientTransport } from '../../classes/transports/SocketWebRTCClientTransport';

export const EnginePage: FunctionComponent = (props: any) => {
  const [actorEntity, setActorEntity] = useState(null);
  const [actorAvatarId, setActorAvatarId] = useState('Rose');

  useEffect(() => {
    const networkSchema: NetworkSchema = {
      ...DefaultNetworkSchema,
      transport: SocketWebRTCClientTransport
    };

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

    addObject3DComponent(createEntity(), {
      obj3d: AmbientLight, ob3dArgs: {
        intensity: 100
      }
    });

    const cameraTransform = getMutableComponent<TransformComponent>(CameraComponent.instance.entity, TransformComponent);
    cameraTransform.position.set(0, 1.2, 3);

    createPrefab(staticWorldColliders);

    // const actorEntity = createPrefab(PlayerCharacter);
    // setActorEntity(actorEntity);

    return (): void => {
      if (confirm('hot update! do cleanup/reload?')) {
        document.location.reload();
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
