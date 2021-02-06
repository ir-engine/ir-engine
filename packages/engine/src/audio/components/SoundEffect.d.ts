import { Component } from "../../ecs/classes/Component";
/** Component class for Sound Effect. */
export declare class SoundEffect extends Component<SoundEffect> {
    /** Audio track container. */
    audio: any;
    /** Source of the audio track. */
    src: any;
    /** Volumne of the sound track. **Default** value is 0.5. */
    volume: number;
    constructor();
}
