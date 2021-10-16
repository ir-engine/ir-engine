import { adminReducer } from './admin/AdminState'
import { adminUserReducer } from './admin/user/UserState'
import { contentPackReducer } from './contentPack/ContentPackState'
import { adminAvatarReducer } from './admin/avatar/AvatarState'
import { adminInstanceReducer } from './admin/instance/InstanceState'
import { adminLocationReducer } from './admin/location/LocationState'
import { adminPartyReducer } from './admin/party/PartyState'
import { adminRouteReducer } from './admin/routes/RouteState'
import { adminSceneReducer } from './admin/scene/SceneState'
import { adminBotsReducer } from './admin/bots/BotsState'
import { AdminAnalyticsReducer } from './admin/analytics/AnalyticsState'
import { adminRealityPackReducer } from './admin/reality-pack/RealityPackState'
import { arMediaReducer } from '../../social/reducers/arMedia/ArMediaState'
import { feedReducer } from '../../social/reducers/feed/FeedState'
import { creatorReducer } from '../../social/reducers/creator/CreatorState'
import { adminGroupReducer } from './admin/group/GroupState'
import { adminScopeReducer } from './admin/scope/ScopeState'
import { settingAnalyticsReducer } from './admin/Setting/analytics/SettingAnalyticsState'
import { serverSettingReducer } from './admin/Setting/server/ServerSettingState'
import { clientSettingReducer } from './admin/Setting/client/ClientSettingState'
import { gameServerSettingReducer } from './admin/Setting/game-server/GameServerSettingState'
import { emailSettingReducer } from './admin/Setting/email/EmailSettingState'
import { chargebeeSettingReducer } from './admin/Setting/chargebee/ChargebeeSettingState'
import { adminAuthSettingReducer } from './admin/Setting/authentication-setting/AuthSettingState'
import { adminAwsSettingReducer } from './admin/Setting/aws/AwsSettingState'
import { adminRedisSettingReducer } from './admin/Setting/redis/AdminRedisSettingState'
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
  admiRoutes: adminRouteReducer,
  adminRealityPack: adminRealityPackReducer,
  adminScene: adminSceneReducer,
  adminBots: adminBotsReducer,
  adminAnalytics: AdminAnalyticsReducer,
  arMedia: arMediaReducer,
  feedsAdmin: feedReducer,
  adminCreator: creatorReducer,
  group: adminGroupReducer,
  scope: adminScopeReducer,
  settingAnalytics: settingAnalyticsReducer,
  serverSettings: serverSettingReducer,
  clientSettings: clientSettingReducer,
  gameServer: gameServerSettingReducer,
  email: emailSettingReducer,
  adminAuthSetting: adminAuthSettingReducer,
  adminAwsSetting: adminAwsSettingReducer,
  adminChargeBeeSetting: chargebeeSettingReducer,
  adminRedisSetting: adminRedisSettingReducer
}
