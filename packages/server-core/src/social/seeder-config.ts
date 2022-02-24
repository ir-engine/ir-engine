import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'

import { channelTypeSeed } from './channel-type/channel-type.seed'
import { groupUserRankSeed } from './group-user-rank/group-user-rank.seed'
import { inviteTypeSeed } from './invite-type/invite-type.seed'
import { locationTypeSeed } from './location-type/location-type.seed'
import { locationSeed } from './location/location.seed'
import { messageStatusSeed } from './message-status/message-status.seed'

export const socialSeeds: Array<ServicesSeedConfig> = [
  groupUserRankSeed,
  inviteTypeSeed,
  messageStatusSeed,
  channelTypeSeed,
  locationTypeSeed,
  locationSeed
]

export default socialSeeds
