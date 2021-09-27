import adminReducer from './admin/reducers'
import adminUserReducer from './admin/user/reducers'
import contentPackReducer from './contentPack/reducers'
import { adminAvatarReducer } from './admin/avatar/AvatarState'
import { adminInstanceReducer } from './admin/instance/InstanceState'
import { adminLocationReducer } from './admin/location/LocationState'
import { adminPartyReducer } from './admin/party/PartyState'
import { adminSceneReducer } from './admin/scene/SceneState'
import { adminBotsReducer } from './admin/bots/BotsState'
import { AdminAnalyticsReducer } from './admin/analytics/AnalyticsState'
import { adminRealityPackReducer } from './admin/reality-pack/RealityPackState'
import arMediaReducer from '@xrengine/social/src/reducers/arMedia/reducers'
import feedsReducer from '@xrengine/social/src/reducers/feed/reducers'
import creatorReducer from '@xrengine/social/src/reducers/creator/reducers'
import { adminGroupReducer } from './admin/group/GroupState'
import scopeReducer from './admin/scope/reducers'

/**
 * TODO: I am moving admin reducer to different packages
 *
 * @author KIMENYI KEVIN <kimenyikevin@gmail.com>
 */

export default {
  adminUser: adminUserReducer,
  admin: adminReducer,
  contentPack: contentPackReducer,
  adminAvatar: adminAvatarReducer,
  adminInstance: adminInstanceReducer,
  adminLocation: adminLocationReducer,
  adminParty: adminPartyReducer,
  adminRealityPack: adminRealityPackReducer,
  adminScene: adminSceneReducer,
  adminBots: adminBotsReducer,
  adminAnalytics: AdminAnalyticsReducer,
  arMedia: arMediaReducer,
  feedsAdmin: feedsReducer,
  adminCreator: creatorReducer,
  group: adminGroupReducer,
  scope: scopeReducer
}
