import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Behavior } from "../../common/interfaces/Behavior";
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { elementPlaying } from './elementPlaying';
import AudioSource from '../classes/AudioSource';
import Video from "../classes/Video";

export const onMediaInteraction: Behavior = (entityInitiator, args, delta, entityInteractive, time) => {
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

export const onMediaInteractionHover: Behavior = (entityInitiator, { focused }: { focused: boolean }, delta, entityInteractive, time) => {
    const { el: mediaElement } = getComponent(entityInteractive, Object3DComponent).value as AudioSource;
    const detail: any = {
        focused,
        action: 'mediaSource',
        interactionText: elementPlaying(mediaElement) ? 'pause video' : 'play video'
    };
    const event = new CustomEvent('object-hover', { detail });
    document.dispatchEvent(event);
};