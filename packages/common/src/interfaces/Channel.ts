import { Group } from './Group'
import { Instance } from './Instance'
import { Message } from './Message'
import { Party } from './Party'
import { User } from './User'

export type ChannelType = 'channel' | 'user' | 'group' | 'instance' | 'party'

export type Channel = {
  id: string
  channelType: ChannelType
  messages: Message[]
  userId1: string | null
  userId2: string | null
  groupId: string | null
  partyId: string | null
  instanceId: string | null
  user1: User
  user2: User
  group: Group
  party: Party
  instance: Instance
  updatedAt: string
  updateNeeded: boolean
  limit: 5
  skip: 0
  total: 0
}
