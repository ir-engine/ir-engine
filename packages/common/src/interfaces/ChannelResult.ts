import { Channel } from './Channel'

export type ChannelResult = {
  data: Channel[]
  total: number
  limit: number
  skip: number
}
