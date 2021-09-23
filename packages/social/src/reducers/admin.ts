import adminReducer from '@xrengine/client-core/src/admin/reducers/admin/reducers'
import adminUserReducer from '@xrengine/client-core/src/admin/reducers/admin/user/reducers'
import contentPackReducer from '@xrengine/client-core/src/admin/reducers/contentPack/reducers'
import { adminAvatarReducer } from '@xrengine/client-core/src/admin/reducers/admin/avatar/AvatarState'
import adminInstanceReducer from '@xrengine/client-core/src/admin/reducers/admin/instance/reducers'
import adminLocationReducer from '@xrengine/client-core/src/admin/reducers/admin/location/reducers'
import adminPartyReducer from '@xrengine/client-core/src/admin/reducers/admin/party/reducers'
import adminSceneReducer from '@xrengine/client-core/src/admin/reducers/admin/scene/reducers'
import { adminBotsReducer } from '@xrengine/client-core/src/admin/reducers/admin/bots/BotsState'
import groupReducer from '@xrengine/client-core/src/admin/reducers/admin/group/reducers'
import scopeReducer from '@xrengine/client-core/src/admin/reducers/admin/scope/reducers'

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
  adminScene: adminSceneReducer,
  adminBots: adminBotsReducer,
  group: groupReducer,
  scope: scopeReducer
}
