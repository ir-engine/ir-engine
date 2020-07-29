/// <reference types="node" />
import Message from "../interfaces/Message";
import DataAudioVideoTransport from "../interfaces/DataAudioVideoTransport";
import { Device } from "mediasoup-client";
export default class SocketWebRTCTransport implements DataAudioVideoTransport {
    mediasoupDevice: Device;
    joined: boolean;
    localCam: MediaStream;
    localScreen: any;
    recvTransport: any;
    sendTransport: any;
    camVideoProducer: any;
    camAudioProducer: any;
    screenVideoProducer: any;
    screenAudioProducer: any;
    lastPollSyncData: {};
    consumers: any[];
    pollingInterval: NodeJS.Timeout;
    screenShareVideoPaused: boolean;
    screenShareAudioPaused: boolean;
    initialized: boolean;
    initializationCallback?: any;
    setLocalConnectionIdCallback: any;
    onConnectedCallback: any;
    clientAddedCallback: any;
    clientRemovedCallback: any;
    getClosestPeersCallback: any;
    getLocalConnectionIdCallback: any;
    stopCamera(): Promise<boolean>;
    stopScreenshare(): Promise<boolean>;
    startAudio(): boolean;
    stopAudio(): boolean;
    muteUser(userId: number): void;
    unmuteUser(userId: number): void;
    deinitialize(): boolean;
    getAllMessages(): Message[];
    addMessageToQueue(message: Message): boolean;
    sendAllMessages(): void;
    initialize(initializationCallback: any, setLocalConnectionIdCallback: any, onConnectedCallback: any, clientAddedCallback: any, clientRemovedCallback: any, getClosestPeersCallback: any, getLocalConnectionIdCallback: any): Promise<void>;
    removeClientDOMElements(_id: any): void;
    joinRoom(): Promise<void>;
    sendCameraStreams(): Promise<void>;
    startScreenshare(): Promise<boolean>;
    startCamera(): Promise<boolean>;
    cycleCamera(): Promise<boolean>;
    stopSendingMediaStreams(): Promise<boolean>;
    leaveRoom(): Promise<boolean>;
    subscribeToTrack(peerId: string, mediaTag: string): Promise<void>;
    unsubscribeFromTrack(peerId: any, mediaTag: any): Promise<void>;
    pauseConsumer(consumer: {
        appData: {
            peerId: any;
            mediaTag: any;
        };
        id: any;
        pause: () => any;
    }): Promise<void>;
    resumeConsumer(consumer: {
        appData: {
            peerId: any;
            mediaTag: any;
        };
        id: any;
        resume: () => any;
    }): Promise<void>;
    pauseProducer(producer: {
        appData: {
            mediaTag: any;
        };
        id: any;
        pause: () => any;
    }): Promise<void>;
    resumeProducer(producer: {
        appData: {
            mediaTag: any;
        };
        id: any;
        resume: () => any;
    }): Promise<void>;
    closeConsumer(consumer: any): Promise<void>;
    createTransport(direction: string): Promise<any>;
    pollAndUpdate(): Promise<void>;
    getScreenPausedState(): boolean;
    getScreenAudioPausedState(): boolean;
    toggleWebcamVideoPauseState(): Promise<void>;
    toggleWebcamAudioPauseState(): Promise<void>;
    toggleScreenshareVideoPauseState(): Promise<void>;
    toggleScreenshareAudioPauseState(): Promise<void>;
    addVideoAudio(consumer: {
        track: {
            clone: () => MediaStreamTrack;
        };
        kind: string;
    }, peerId: any): void;
    removeVideoAudio(consumer: any): void;
    getCurrentDeviceId(): Promise<any>;
    CAM_VIDEO_SIMULCAST_ENCODINGS: {
        maxBitrate: number;
        scaleResolutionDownBy: number;
    }[];
    camEncodings(): {
        maxBitrate: number;
        scaleResolutionDownBy: number;
    }[];
    screenshareEncodings(): void;
    sleep(ms: number): Promise<unknown>;
}
