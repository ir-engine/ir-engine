import { Component } from "../../ecs/classes/Component";
export declare class MediaStreamComponent extends Component<any> {
    static instance: MediaStreamComponent;
    videoPaused: boolean;
    audioPaused: boolean;
    mediaStream: MediaStream;
    localScreen: any;
    camVideoProducer: any;
    camAudioProducer: any;
    screenVideoProducer: any;
    screenAudioProducer: any;
    consumers: any[];
    screenShareVideoPaused: boolean;
    screenShareAudioPaused: boolean;
    constructor();
    toggleVideoPaused(): boolean;
    toggleAudioPaused(): boolean;
}
