import DataAudioTransport from "./DataAudioTransport"

export default interface DataAudioVideoTransport extends DataAudioTransport {
  startScreenshare(): boolean
  startCamera(): boolean
  cycleCamera(): boolean

  stopCamera(): boolean
  stopScreenshare(): boolean
}
