import { Component } from "../../ecs/classes/Component";
/** Component class for background music. */
export declare class BackgroundMusic extends Component<BackgroundMusic> {
    /** Audio track container. */
    audio: any;
    /** Source of the audio track. */
    src: any;
    /** Volumne of the sound track. **Default** value is 0.5. */
    volume: number;
    constructor();
}
