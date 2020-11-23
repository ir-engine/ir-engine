import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
export default class VolumetricPlayer {
    mesh: any;
    model: any;
    gltf: any;
    audio: any;
    startFrame: number;
    currentFrame: number;
    endFrame: number;
    isPlaying: boolean;
    frameObject: any;
    loader: GLTFLoader;
    dracoLoader: DRACOLoader;
    scene: any;
    file: any;
    frameRate: number;
    frameCount: number;
    onLoaded: any;
    loop: boolean;
    speedMultiplier: number;
    audioMode: boolean;
    play(): void;
    pause(): void;
    reset(): void;
    goToFrame(frame: number): void;
    setSpeed(multiplyScalar: number): void;
    show(): void;
    hide(): void;
    fadeIn(stepLength: number, fadeTime: number, currentTime?: number): void;
    fadeOut(stepLength: number, fadeTime: number, currentTime?: number): void;
    lerp(v0: number, v1: number, t: number): number;
    hideAll(): void;
    enableShadowCasting(enable: boolean): void;
    constructor(scene: any, file: string, audioFile: string, onLoaded: any, startScale?: number, startPosition?: {
        x: any;
        y: any;
        z: any;
    }, startRotation?: {
        x: any;
        y: any;
        z: any;
    }, castShadow?: boolean, playOnStart?: boolean, showFirstFrameOnStart?: boolean, loop?: boolean, startFrame?: number, endFrame?: number, frameRate?: number, speedMultiplier?: number);
    getObjectByCurrentFrame(index: number): any;
    padFrameNumberWithZeros(n: any, width: number): any;
    update(): void;
}
