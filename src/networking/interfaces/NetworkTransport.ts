export default interface NetworkTransport {
  supportsMediaStreams: boolean
  initialize(address: string, port: number): void | Promise<void>
  sendAllReliableMessages(): void
}
