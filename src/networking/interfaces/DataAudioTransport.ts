import DataTransport from "./DataTransport"

export default interface DataAudioTransport extends DataTransport {
  startAudio(): boolean
  stopAudio(): boolean

  muteUser(userId: number)
  unmuteUser(userId: number)
}
