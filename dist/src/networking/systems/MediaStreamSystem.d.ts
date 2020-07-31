import { System, World } from "ecsy";
import MediaStreamComponent from "../components/MediaStreamComponent";
export declare class MediaStreamControlSystem extends System {
    static instance: MediaStreamControlSystem;
    mediaStreamComponent: MediaStreamComponent;
    constructor(world: World);
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
    stopCamera(): Promise<boolean>;
    stopScreenshare(): Promise<boolean>;
    startAudio(): boolean;
    stopAudio(): boolean;
    muteUser(userId: number): void;
    unmuteUser(userId: number): void;
    getMediaStream(): Promise<boolean>;
}
