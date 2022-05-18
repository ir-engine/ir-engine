import { Message } from './Message'

export type MessageResult = {
  data: Message[]
  total: number
  limit: number
  skip: number
  channelId: string
}
