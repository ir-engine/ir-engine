import { MessageStatus } from './MessageStatus'
import { User } from './User'
import { UserId } from './UserId'

export type Message = {
  id: string
  senderId: UserId
  channelId: string
  text: string
  createdAt: string
  updatedAt: string
  sender: User
  messageStatus: MessageStatus
}
