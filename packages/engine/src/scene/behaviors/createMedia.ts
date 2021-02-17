import Video from '@xr3ngine/engine/src/scene/classes/Video';
import { Object3D } from 'three';
import { addObject3DComponent } from './addObject3DComponent';
import { Engine } from '../../ecs/classes/Engine';
import { Interactable } from "../../interaction/components/Interactable";
import { addComponent } from "../../ecs/functions/EntityFunctions";

import { Behavior } from "../../common/interfaces/Behavior";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import AudioSource from '../classes/AudioSource';
import { Object3DComponent } from '../components/Object3DComponent';

const elementPlaying = (element: HTMLMediaElement): boolean => {
    return element && (!!(element.currentTime > 0 && !element.paused && !element.ended && element.readyState > 2));
};

const onMediaInteraction: Behavior = (entityInitiator, args, delta, entityInteractive, time) => {
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

    mediaElement.onplay = () => { onVideoStateChange(true); };
    mediaElement.onpause = () => { onVideoStateChange(false); };

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