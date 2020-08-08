import MessageTypeAlias from "../types/MessageTypeAlias"

export interface NetworkMessageBehavior {
  (messageType: MessageTypeAlias, messageData: any): void
}
