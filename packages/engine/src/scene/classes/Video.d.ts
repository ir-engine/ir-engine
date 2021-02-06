import { VideoTexture, Mesh } from "three";
import AudioSource from "./AudioSource";
export declare const VideoProjection: {
    Flat: string;
    Equirectangular360: string;
};
export default class Video extends AudioSource {
    _videoTexture: VideoTexture;
    el: HTMLVideoElement;
    _texture: any;
    _mesh: Mesh;
    _projection: string;
    hls: any;
    audioSource: any;
    audioListener: any;
    audio: any;
    constructor(audioListener: any);
    loadVideo(src: any, contentType: any): Promise<unknown>;
    get projection(): string;
    set projection(projection: string);
    load(src: any, contentType: any): Promise<this>;
    onResize(): void;
    clone(recursive: any): any;
    copy(source: any, recursive?: boolean): this;
}
