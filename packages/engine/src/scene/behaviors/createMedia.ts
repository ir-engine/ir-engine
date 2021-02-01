import Video from '@xr3ngine/engine/src/scene/classes/Video';
import { Object3D } from 'three';
import { addObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { Engine } from '../../ecs/classes/Engine';
import { Interactable } from "../../interaction/components/Interactable";
import { addComponent } from "../../ecs/functions/EntityFunctions";
import { onMediaInteraction, onMediaInteractionHover } from '../functions/mediaInteractive'

export function createMedia(entity, args: {
  obj3d;
  objArgs: any
}): void {
  addObject3DComponent(entity, { obj3d: new Video(Engine.audioListener), objArgs: args.objArgs });
  addInteraction(entity)
}

export function createMediaServer(entity, args: {
  obj3d;
  objArgs: any
}): void {
  addObject3DComponent(entity, { obj3d: new Object3D(), objArgs: args.objArgs });
  addInteraction(entity)
}

function addInteraction(entity): void {

  const data = {
    action: 'mediaSource',
  };

  const interactiveData = {
    onInteraction: onMediaInteraction,
    onInteractionFocused: onMediaInteractionHover,
    data
  };

  addComponent(entity, Interactable, interactiveData);
}