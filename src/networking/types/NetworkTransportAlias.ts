import DataTransport from "../interfaces/DataTransport"
import DataAudioTransport from "../interfaces/DataAudioTransport"
import DataAudioVideoTransport from "../interfaces/DataAudioVideoTransport"

export type NetworkTransportAlias = DataTransport | DataAudioTransport | DataAudioVideoTransport

export default NetworkTransportAlias
