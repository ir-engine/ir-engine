import Message from "./Message"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export default interface NetworkTransport {
  initialize(): boolean
  deinitialize(): boolean
  getAllMessages: Message[]
  addMessageToQueue(message: Message): boolean
  sendAllMessages()
}
