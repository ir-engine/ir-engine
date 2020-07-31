import { Component } from "ecsy";
import NetworkTransport from "../interfaces/NetworkTransport";
export default class MediaStreamComponent extends Component<any> {
    static instance: MediaStreamComponent;
    transport: NetworkTransport;
    initialized: boolean;
    localScreen: any;
    camVideoProducer: any;
    camAudioProducer: any;
    screenVideoProducer: any;
    screenAudioProducer: any;
    consumers: any[];
    screenShareVideoPaused: boolean;
    screenShareAudioPaused: boolean;
    videoPaused: boolean;
    audioPaused: boolean;
    mediaStream: MediaStream;
    constructor();
    toggleVideoPaused(): boolean;
    toggleAudioPaused(): boolean;
}
