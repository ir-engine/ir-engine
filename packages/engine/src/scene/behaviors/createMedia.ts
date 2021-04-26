import Video from '../../scene/classes/Video';
import Audio from '../../scene/classes/AudioSource';
import { Object3D } from 'three';
import { addObject3DComponent } from './addObject3DComponent';
import { Engine } from '../../ecs/classes/Engine';
import { Interactable } from "../../interaction/components/Interactable";
import { Behavior } from "../../common/interfaces/Behavior";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import AudioSource from '../classes/AudioSource';
import { Object3DComponent } from '../components/Object3DComponent';
import { isWebWorker } from '../../common/functions/getEnvironment';
import VolumetricComponent from "../components/VolumetricComponent"
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { InteractiveSystem } from '../../interaction/systems/InteractiveSystem';

const isBrowser=new Function("try {return this===window;}catch(e){ return false;}");

let DracosisPlayer = null;
if (isBrowser())
  import("@xr3ngine/volumetric/src/Player").then(imported => {
    DracosisPlayer = imported;
  });



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
  
  const source = getComponent(entityInteractive, Object3DComponent).value as AudioSource;

  if (elementPlaying(source.el)) {
    source?.pause();
  } else {
    source?.play();
  }
};

const onMediaInteractionHover: Behavior = (entityInitiator, { focused }: { focused: boolean }, delta, entityInteractive, time) => {
  const { el: mediaElement } = getComponent(entityInteractive, Object3DComponent).value as AudioSource;

  EngineEvents.instance.dispatchEvent({ 
    type: InteractiveSystem.EVENTS.OBJECT_HOVER, 
    focused,
    interactionType: 'mediaSource',
    interactionText: elementPlaying(mediaElement) ? 'pause video' : 'play video'
  });
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
    frameRate: 25
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
    interactionType: 'mediaSource',
  };

  const interactiveData = {
    onInteraction: onMediaInteraction,
    onInteractionFocused: onMediaInteractionHover,
    data
  };

  addComponent(entity, Interactable, interactiveData);

  const onVideoStateChange = (didPlay) => {
    EngineEvents.instance.dispatchEvent({ 
      type: InteractiveSystem.EVENTS.OBJECT_HOVER, 
      focused: true,
      interactionType: 'mediaSource',
      interactionText: didPlay ? 'pause media' : 'play media' 
    })
  };

  const { el: mediaElement } = getComponent(entity, Object3DComponent).value as AudioSource;
  
  if(mediaElement) { 
    mediaElement.addEventListener('play', () => {
      onVideoStateChange(true);
    });
    mediaElement.addEventListener('pause', () => {
      onVideoStateChange(false);
    });
  }
}