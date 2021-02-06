import { System } from '../../ecs/classes/System';
/** System class for media streaming. */
export declare class MediaStreamSystem extends System {
    static instance: any;
    /** Whether the video is paused or not. */
    videoPaused: boolean;
    /** Whether the audio is paused or not. */
    audioPaused: boolean;
    /** Whether the face tracking is enabled or not. */
    faceTracking: boolean;
    /** Media stream for streaming data. */
    mediaStream: MediaStream;
    /** Audio Gain to be applied on media stream. */
    audioGainNode: GainNode;
    /** Local screen container. */
    localScreen: any;
    /** Producer using camera to get Video. */
    camVideoProducer: any;
    /** Producer using camera to get Audio. */
    camAudioProducer: any;
    /** Producer using screen to get Video. */
    screenVideoProducer: any;
    /** Producer using screen to get Audio. */
    screenAudioProducer: any;
    /** List of all producers nodes.. */
    producers: any[];
    /** List of all consumer nodes. */
    consumers: any[];
    /** Indication of whether the video while screen sharing is paused or not. */
    screenShareVideoPaused: boolean;
    /** Indication of whether the audio while screen sharing is paused or not. */
    screenShareAudioPaused: boolean;
    /** Whether the component is initialized or not. */
    initialized: boolean;
    constructor();
    /**
     * Set face tracking state.
     * @param state New face tracking state.
     * @returns Updated face tracking state.
     */
    setFaceTracking(state: boolean): boolean;
    /**
     * Pause/Resume the video.
     * @param state New Pause state.
     * @returns Updated Pause state.
     */
    setVideoPaused(state: boolean): boolean;
    /**
     * Pause/Resume the audio.
     * @param state New Pause state.
     * @returns Updated Pause state.
     */
    setAudioPaused(state: boolean): boolean;
    /**
     * Pause/Resume the video while screen sharing.
     * @param state New Pause state.
     * @returns Updated Pause state.
     */
    setScreenShareVideoPaused(state: boolean): boolean;
    /**
     * Pause/Resume the audio while screen sharing.
     * @param state New Pause state.
     * @returns Updated Pause state.
     */
    setScreenShareAudioPaused(state: boolean): boolean;
    /**
     * Toggle Pause state of video.
     * @returns Updated Pause state.
     */
    toggleVideoPaused(): boolean;
    /**
     * Toggle Pause state of audio.
     * @returns Updated Pause state.
     */
    toggleAudioPaused(): boolean;
    /**
     * Toggle Pause state of video while screen sharing.
     * @returns Updated Pause state.
     */
    toggleScreenShareVideoPaused(): boolean;
    /**
     * Toggle Pause state of audio while screen sharing.
     * @returns Updated Pause state.
     */
    toggleScreenShareAudioPaused(): boolean;
    /** Execute the media stream system. */
    execute(): void;
    /**
     * Start the camera.
     * @returns Whether the camera is started or not. */
    startCamera(): Promise<boolean>;
    /**
     * Switch to sending video from the "next" camera device in device list (if there are multiple cameras).
     * @returns Whether camera cycled or not.
     */
    cycleCamera(): Promise<boolean>;
    /**
     * Get whether screen video paused or not.
     * @returns Screen video paused state.
     */
    getScreenPausedState(): boolean;
    /**
     * Get whether screen audio paused or not.
     * @returns Screen audio paused state.
     */
    getScreenAudioPausedState(): boolean;
    /**
     * Remove video and audio node from the consumer.
     * @param consumer Consumer from which video and audio node will be removed.
     */
    static removeVideoAudio(consumer: any): void;
    /**
     * Add video and audio node to the consumer.
     * @param mediaStream Video and/or audio media stream to be added in element.
     * @param peerId ID to be used to find peer element in which media stream will be added.
     */
    static addVideoAudio(mediaStream: {
        track: {
            clone: () => MediaStreamTrack;
        };
        kind: string;
    }, peerId: any): void;
    /** Get device ID of device which is currently streaming media. */
    getCurrentDeviceId(): Promise<string> | null;
    /**
     * Get user media stream.
     * @returns Whether stream is active or not.
     */
    getMediaStream(): Promise<boolean>;
}
