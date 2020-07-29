import Message from "./Message"

export default interface DataTransport {
  initialize(
    initializationCallback: any,
    setLocalConnectionIdCallback: any,
    onConnectedCallback: any,
    clientAddedCallback: any,
    clientRemovedCallback: any,
    getClosestPeersCallback: any,
    getLocalConnectionIdCallback: any
  ): void
  deinitialize(deinitializationCallback?: any): boolean
  getAllMessages(): Message[]
  addMessageToQueue(message: Message): boolean
  sendAllMessages()
}
