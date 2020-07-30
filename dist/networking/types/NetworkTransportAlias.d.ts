import DataTransport from "../interfaces/DataTransport";
import DataAudioTransport from "../interfaces/DataAudioTransport";
import DataAudioVideoTransport from "../interfaces/DataAudioVideoTransport";
export declare type NetworkTransport = DataTransport | DataAudioTransport | DataAudioVideoTransport;
export default NetworkTransport;
