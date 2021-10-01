import { adminReducer } from './admin/AdminState'
import { adminUserReducer } from './admin/user/UserState'
import { contentPackReducer } from './contentPack/ContentPackState'
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
import { adminScopeReducer } from './admin/scope/ScopeState'
import settingAnalyticsReducer from './admin/Setting/analytics/reducers'
import settingServerReducer from './admin/Setting/server/reducers'
import clientSettingReducer from './admin/Setting/client/reducers'
import gameServerSettingReducer from './admin/Setting/game-server/reducers'
import emailSettingReducer from './admin/Setting/email/reducers'
import chargebeeSettingReducer from './admin/Setting/chargebee/reducers'
import authSettingReducer from './admin/Setting/authentication-setting/reducers'
import awsSettingReducer from './admin/Setting/aws/reducer'
import redisSettingReducer from './admin/Setting/redis/reducer'
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
  scope: adminScopeReducer,
  settingAnalytics: settingAnalyticsReducer,
  serverSettings: settingServerReducer,
  clientSettings: clientSettingReducer,
  gameServer: gameServerSettingReducer,
  email: emailSettingReducer,
  adminAuthSetting: authSettingReducer,
  adminAwsSetting: awsSettingReducer,
  adminChargeBeeSetting: chargebeeSettingReducer,
  adminRedisSetting: redisSettingReducer
}
