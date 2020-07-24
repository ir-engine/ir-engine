import { MessageTypeAlias } from "../types/MessageTypeAlias"
export default interface Message {
  messageType: MessageTypeAlias
  data: any
}
