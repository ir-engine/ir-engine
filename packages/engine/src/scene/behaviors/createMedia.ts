import Video from '@xr3ngine/engine/src/scene/classes/Video';
import Audio from '@xr3ngine/engine/src/scene/classes/AudioSource';
import { Object3D } from 'three';
import { addObject3DComponent } from './addObject3DComponent';
import { Engine } from '../../ecs/classes/Engine';
import { Interactable } from "../../interaction/components/Interactable";
import { Behavior } from "../../common/interfaces/Behavior";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import AudioSource from '../classes/AudioSource';
import { Object3DComponent } from '../components/Object3DComponent';
import { isWebWorker } from '../../common/functions/getEnvironment';
import DracosisPlayer from '@xr3ngine/volumetric/src/Player';
import VolumetricComponent from "../components/VolumetricComponent"
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { Network } from '../../networking/classes/Network';

const elementPlaying = (element: any): boolean => {
  if(isWebWorker) return element?._isPlaying;
  return element && (!!(element.currentTime > 0 && !element.paused && !element.ended && element.readyState > 2));
};

const onMediaInteraction: Behavior = (entityInitiator, args, delta, entityInteractive, time) => {
  const volumetric = getComponent(entityInteractive, VolumetricComponent);

  if(volumetric) {
    // TODO handle volumetric interaction here
    return
  }

  const { el: mediaElement } = getComponent(entityInteractive, Object3DComponent).value as AudioSource;
  const onVideoStateChange = (didPlay) => {
    const detail: any = {
      focused: true,
      action: 'mediaSource',
      interactionText: didPlay ? 'pause media' : 'play media'
    };
    const event = new CustomEvent('object-hover', { detail });
    document.dispatchEvent(event);
  };

  mediaElement.addEventListener('play', () => {
    onVideoStateChange(true);
  });
  mediaElement.addEventListener('pause', () => {
    onVideoStateChange(false);
  });

  if (elementPlaying(mediaElement)) {
    mediaElement?.pause();
  } else {
    mediaElement?.play();
  }
};

const onMediaInteractionHover: Behavior = (entityInitiator, { focused }: { focused: boolean }, delta, entityInteractive, time) => {
  const { el: mediaElement } = getComponent(entityInteractive, Object3DComponent).value as AudioSource;
  const detail: any = {
    focused,
    action: 'mediaSource',
    interactionText: elementPlaying(mediaElement) ? 'pause video' : 'play video'
  };
  const event = new CustomEvent('object-hover', { detail });
  document.dispatchEvent(event);
};

export function createAudio(entity, args: {
  obj3d;
  objArgs: any
}): void {
  addObject3DComponent(entity, { obj3d: new Audio(Engine.audioListener), objArgs: args.objArgs });
  addInteraction(entity)
}


export function createVideo(entity, args: {
  obj3d;
  objArgs: any
}): void {
  addObject3DComponent(entity, { obj3d: new Video(Engine.audioListener), objArgs: args.objArgs });
  addInteraction(entity)
}

export const createVolumetric: Behavior = (entity, args: { objArgs }) => {
  addComponent(entity, VolumetricComponent);
  const volumetricComponent = getMutableComponent(entity, VolumetricComponent);
  const container = new Object3D();
  const DracosisSequence = new DracosisPlayer({
    scene: container,
    renderer: Engine.renderer,
    meshFilePath: args.objArgs.src,
    videoFilePath: args.objArgs.src.replace(".drcs", ".mp4"),
    loop: args.objArgs.loop,
    autoplay: args.objArgs.autoPlay,
    scale: 1,
    frameRate: 25,
    keyframesToBufferBeforeStart: 250
  });
  volumetricComponent.player = DracosisSequence;
  addObject3DComponent(entity, { obj3d: container });//, objArgs: args.objArgs });
  addInteraction(entity)
};

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