import DataAudioTransport from "./DataAudioTransport";
export default interface DataAudioVideoTransport extends DataAudioTransport {
    startScreenshare(): Promise<boolean>;
    startCamera(): Promise<boolean>;
    cycleCamera(): Promise<boolean>;
    stopCamera(): Promise<boolean>;
    stopScreenshare(): Promise<boolean>;
}
