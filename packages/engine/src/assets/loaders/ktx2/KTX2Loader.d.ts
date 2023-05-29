import { CompressedTexture } from "three";

export class KTX2Loader extends CompressedTextureLoader {
    constructor(manager?: LoadingManager);

    setTranscoderPath(path: string): KTX2Loader;
    setWorkerLimit(limit: number): KTX2Loader;
    detectSupport(renderer: WebGLRenderer): KTX2Loader;
    dispose(): KTX2Loader;

    parse(
        buffer: ArrayBuffer,
        onLoad: (texture: CompressedTexture) => void,
        onError?: (event: ErrorEvent) => void,
    ): KTX2Loader;

    load(
        url: string,
        onLoad: (texture: CompressedTexture) => void,
        onProgress: (requrest: ProgressEvent<EventTarget>) => void | undefined,
        onError: ((event: ErrorEvent) => void) | undefined
    ): CompressedTexture
}