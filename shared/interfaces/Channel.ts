import { Message } from './Message'

export type Channel = {
  id: string
  channelType: string,
  Messages: Message[],
  userId1: string | null,
  userId2: string | null,
  groupId: string | null,
  partyId: string | null,
  instanceId: string | null
}