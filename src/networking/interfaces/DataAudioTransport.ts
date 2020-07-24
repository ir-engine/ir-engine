import DataTransport from "./DataTransport"

export default interface DataAudioTransport extends DataTransport {
  startAudio(): boolean
  stopAudio(): boolean

  joinMediaRoom(roomId: string | number): boolean
  leaveMediaRoom(): void

  muteUser(userId: number)
  unmuteUser(userId: number)
}
