import { adminReducer } from '@xrengine/client-core/src/admin/reducers/admin/AdminState'
import { adminUserReducer } from '@xrengine/client-core/src/admin/reducers/admin/user/UserState'
import { contentPackReducer } from '@xrengine/client-core/src/admin/reducers/contentPack/ContentPackState'
import { adminAvatarReducer } from '@xrengine/client-core/src/admin/reducers/admin/avatar/AvatarState'
import { adminInstanceReducer } from '@xrengine/client-core/src/admin/reducers/admin/instance/InstanceState'
import { adminLocationReducer } from '@xrengine/client-core/src/admin/reducers/admin/location/LocationState'
import { adminPartyReducer } from '@xrengine/client-core/src/admin/reducers/admin/party/PartyState'
import { adminSceneReducer } from '@xrengine/client-core/src/admin/reducers/admin/scene/SceneState'
import { adminBotsReducer } from '@xrengine/client-core/src/admin/reducers/admin/bots/BotsState'
import { adminGroupReducer } from '@xrengine/client-core/src/admin/reducers/admin/group/GroupState'
import { adminScopeReducer } from '@xrengine/client-core/src/admin/reducers/admin/scope/ScopeState'

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
  group: adminGroupReducer,
  scope: adminScopeReducer
}
