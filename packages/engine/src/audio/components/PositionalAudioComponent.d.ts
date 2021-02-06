import { PositionalAudio } from 'three';
import { Component } from '../../ecs/classes/Component';
/** Component wrapper class fro {@link https://threejs.org/docs/index.html#api/en/audio/PositionalAudio | PositionalAudio } from three.js. */
export declare class PositionalAudioComponent extends Component<PositionalAudioComponent> {
    /** Position audio container. */
    value?: PositionalAudio;
}
