import { Object3D } from "three";
export declare const AudioType: {
    Stereo: string;
    PannerNode: string;
};
export declare const DistanceModelType: {
    Linear: string;
    Inverse: string;
    Exponential: string;
};
export declare const AudioTypeOptions: {
    label: string;
    value: string;
}[];
export declare const DistanceModelOptions: {
    label: string;
    value: string;
}[];
export default class AudioSource extends Object3D {
    el: HTMLMediaElement;
    _src: string;
    audioListener: any;
    controls: boolean;
    _audioType: any;
    audio: any;
    audioSource: any;
    constructor(audioListener: any, elTag?: string);
    get duration(): any;
    get src(): any;
    set src(src: any);
    get autoPlay(): any;
    set autoPlay(value: any);
    get loop(): any;
    set loop(value: any);
    get audioType(): any;
    set audioType(type: any);
    get volume(): any;
    set volume(value: any);
    get distanceModel(): any;
    set distanceModel(value: any);
    get rolloffFactor(): any;
    set rolloffFactor(value: any);
    get refDistance(): any;
    set refDistance(value: any);
    get maxDistance(): any;
    set maxDistance(value: any);
    get coneInnerAngle(): any;
    set coneInnerAngle(value: any);
    get coneOuterAngle(): any;
    set coneOuterAngle(value: any);
    get coneOuterGain(): any;
    set coneOuterGain(value: any);
    loadMedia(src: any): Promise<void>;
    load(src: any, contentType?: any): Promise<this>;
    copy(source: any, recursive?: boolean): this;
}
