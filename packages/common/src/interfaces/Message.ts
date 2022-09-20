import { MessageStatus } from './MessageStatus'
import { UserInterface } from './User'
import { UserId } from './UserId'

export type Message = {
  id: string
  senderId: UserId
  channelId: string
  text: string
  isNotification: boolean
  createdAt: string
  updatedAt: string
  sender: UserInterface
  messageStatus: MessageStatus
}
