import { Attributes, System } from "../../ecs/classes/System";
import { Engine } from "../../ecs/classes/Engine";
export declare class MediaStreamSystem extends System {
    static instance: MediaStreamSystem;
    init(attributes?: Attributes): void;
    constructor(world: Engine);
    execute(): void;
    startCamera(): Promise<boolean>;
    cycleCamera(): Promise<boolean>;
    getScreenPausedState(): boolean;
    getScreenAudioPausedState(): boolean;
    toggleWebcamVideoPauseState(): Promise<void>;
    toggleWebcamAudioPauseState(): Promise<void>;
    toggleScreenshareVideoPauseState(): Promise<void>;
    toggleScreenshareAudioPauseState(): Promise<void>;
    removeVideoAudio(consumer: any): void;
    addVideoAudio(consumer: {
        track: {
            clone: () => MediaStreamTrack;
        };
        kind: string;
    }, peerId: any): void;
    getCurrentDeviceId(): Promise<any>;
    getMediaStream(): Promise<boolean>;
}
