import { Channel } from './Channel'

export interface ChannelResult {
  data: Channel[]
  total: number
  limit: number
  skip: number
}
