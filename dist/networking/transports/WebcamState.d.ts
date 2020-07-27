declare class WebcamState {
    _videoPaused: boolean;
    _audioPaused: boolean;
    constructor();
    set videoPaused(paused: boolean);
    get videoPaused(): boolean;
    set audioPaused(paused: boolean);
    get audioPaused(): boolean;
    toggleVideoPaused(): boolean;
    toggleAudioPaused(): boolean;
}
declare const webcamState: WebcamState;
export { webcamState };
