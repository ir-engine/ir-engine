import { User } from './User'
import { MessageStatus } from './MessageStatus'

export type Message = {
  id: string
  senderId: string,
  channelId: string,
  text: string,
  createdAt: string,
  updatedAt: string,
  sender: User,
  message_statuses: MessageStatus
}