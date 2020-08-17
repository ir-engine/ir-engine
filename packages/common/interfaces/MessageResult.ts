import { Message } from './Message'

export interface MessageResult {
  data: Message[]
  total: number
  limit: number
  skip: number
  channelId: string
}
