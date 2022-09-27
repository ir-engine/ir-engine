import { World } from '@xrengine/engine/src/ecs/classes/World'
import { createActionQueue, removeActionQueue } from '@xrengine/hyperflux'

import { AdminActiveRouteActions, AdminActiveRouteReceptors } from '../admin/services/ActiveRouteService'
import { AdminAnalyticsActions, AdminAnalyticsReceptors } from '../admin/services/AnalyticsService'
import { AdminAvatarActions, AdminAvatarReceptors } from '../admin/services/AvatarService'
import { AdminBotCommandActions, AdminBotsCommandReceptors } from '../admin/services/BotsCommand'
import { AdminBotsActions, AdminBotServiceReceptors } from '../admin/services/BotsService'
import { AdminGithubAppActions, AdminGithubAppReceptors } from '../admin/services/GithubAppService'
import { AdminGroupActions, AdminGroupServiceReceptors } from '../admin/services/GroupService'
import { AdminInstanceserverActions, InstanceServerSettingReceptors } from '../admin/services/InstanceserverService'
import { AdminInstanceActions, AdminInstanceReceptors } from '../admin/services/InstanceService'
import { AdminInviteActions, AdminInviteReceptors } from '../admin/services/InviteService'
import { AdminLocationActions, AdminLocationReceptors } from '../admin/services/LocationService'
import { AdminPartyActions, AdminPartyReceptors } from '../admin/services/PartyService'
import { AdminResourceActions, AdminResourceReceptors } from '../admin/services/ResourceService'
import { AdminRouteActions, AdminRouteReceptors } from '../admin/services/RouteService'
import { AdminSceneActions, AdminSceneReceptors } from '../admin/services/SceneService'
import { AdminScopeTypeActions, AdminScopeTypeReceptor } from '../admin/services/ScopeTypeService'
import { AdminRedisSettingActions, RedisSettingReceptors } from '../admin/services/Setting/AdminRedisSettingService'
import {
  AdminAnalyticsSettingActions,
  AnalyticsSettingReceptors
} from '../admin/services/Setting/AnalyticsSettingsService'
// import { AuthSettingsActions, AuthSettingsReceptors } from '../admin/services/Setting/AuthSettingService'
import { AdminAwsSettingActions, AwsSettingReceptors } from '../admin/services/Setting/AwsSettingService'
import {
  AdminChargebeeReceptors,
  AdminChargebeeSettingActions
} from '../admin/services/Setting/ChargebeeSettingService'
// import { ClientSettingActions, ClientSettingReceptors } from '../admin/services/Setting/ClientSettingService'
import { AdminCoilSettingActions, CoilSettingReceptors } from '../admin/services/Setting/CoilSettingService'
import { EmailSettingActions, EmailSettingReceptors } from '../admin/services/Setting/EmailSettingService'
import {
  AdminInstanceServerReceptors,
  InstanceServerSettingActions
} from '../admin/services/Setting/InstanceServerSettingService'
import { AdminProjectSettingsActions, ProjectSettingReceptors } from '../admin/services/Setting/ProjectSettingService'
import { AdminServerSettingActions, ServerSettingReceptors } from '../admin/services/Setting/ServerSettingService'
import { AdminTestBotActions, AdminTestBotReceptors } from '../admin/services/TestBotService'
import { AdminUserActions, AdminUserReceptors } from '../admin/services/UserService'

export default async function AdminSystem(world: World) {
  const fetchedAnalyticsQueue = createActionQueue(AdminAnalyticsSettingActions.fetchedAnalytics.matches)
  const redisSettingRetrievedQueue = createActionQueue(AdminRedisSettingActions.redisSettingRetrieved.matches)
  const awsSettingRetrievedQueue = createActionQueue(AdminAwsSettingActions.awsSettingRetrieved.matches)
  const awsSettingPatchedQueue = createActionQueue(AdminAwsSettingActions.awsSettingPatched.matches)
  const fetchedCoilQueue = createActionQueue(AdminCoilSettingActions.fetchedCoil.matches)
  const fetchedEmailQueue = createActionQueue(EmailSettingActions.fetchedEmail.matches)
  const emailSettingPatchedQueue = createActionQueue(EmailSettingActions.emailSettingPatched.matches)
  const patchInstanceserverQueue = createActionQueue(AdminInstanceserverActions.patchInstanceserver.matches)
  const patchedInstanceserverQueue = createActionQueue(AdminInstanceserverActions.patchedInstanceserver.matches)
  const projectSettingFetchedQueue = createActionQueue(AdminProjectSettingsActions.projectSettingFetched.matches)
  const fetchedSeverInfoQueue = createActionQueue(AdminServerSettingActions.fetchedSeverInfo.matches)
  const serverSettingPatchedQueue = createActionQueue(AdminServerSettingActions.serverSettingPatched.matches)
  const getScopeTypesQueue = createActionQueue(AdminScopeTypeActions.getScopeTypes.matches)
  const instancesRetrievedQueue = createActionQueue(AdminInstanceActions.instancesRetrieved.matches)
  const instanceRemovedQueue = createActionQueue(AdminInstanceActions.instanceRemoved.matches)
  const avatarsFetchedQueue = createActionQueue(AdminAvatarActions.avatarsFetched.matches)
  const avatarCreatedQueue = createActionQueue(AdminAvatarActions.avatarCreated.matches)
  const avatarRemovedQueue = createActionQueue(AdminAvatarActions.avatarRemoved.matches)
  const avatarUpdatedQueue = createActionQueue(AdminAvatarActions.avatarUpdated.matches)
  const resourceFiltersFetchedQueue = createActionQueue(AdminResourceActions.resourceFiltersFetched.matches)
  const resourcesFetchedQueue = createActionQueue(AdminResourceActions.resourcesFetched.matches)
  const setSelectedMimeTypesQueue = createActionQueue(AdminResourceActions.setSelectedMimeTypes.matches)
  const setSelectedResourceTypesQueue = createActionQueue(AdminResourceActions.setSelectedResourceTypes.matches)
  const resourceNeedsUpdateQueue = createActionQueue(AdminResourceActions.resourceNeedsUpdated.matches)
  const resourcesResetFilterQueue = createActionQueue(AdminResourceActions.resourcesResetFilter.matches)
  const scenesFetchedQueue = createActionQueue(AdminSceneActions.scenesFetched.matches)
  const sceneFetchedQueue = createActionQueue(AdminSceneActions.sceneFetched.matches)
  const locationsRetrievedQueue = createActionQueue(AdminLocationActions.locationsRetrieved.matches)
  const locationCreatedQueue = createActionQueue(AdminLocationActions.locationCreated.matches)
  const locationPatchedQueue = createActionQueue(AdminLocationActions.locationPatched.matches)
  const locationRemovedQueue = createActionQueue(AdminLocationActions.locationRemoved.matches)
  const locationTypesRetrievedQueue = createActionQueue(AdminLocationActions.locationTypesRetrieved.matches)
  const partyRetrievedQueue = createActionQueue(AdminPartyActions.partyRetrieved.matches)
  const partyAdminCreatedQueue = createActionQueue(AdminPartyActions.partyAdminCreated.matches)
  const partyRemovedQueue = createActionQueue(AdminPartyActions.partyRemoved.matches)
  const partyPatchedQueue = createActionQueue(AdminPartyActions.partyPatched.matches)
  const activeInstancesFetchedQueue = createActionQueue(AdminAnalyticsActions.activeInstancesFetched.matches)
  const activePartiesFetchedQueue = createActionQueue(AdminAnalyticsActions.activePartiesFetched.matches)
  const activeLocationsFetchedQueue = createActionQueue(AdminAnalyticsActions.activeLocationsFetched.matches)
  const activeScenesFetchedQueue = createActionQueue(AdminAnalyticsActions.activeScenesFetched.matches)
  const channelUsersFetchedQueue = createActionQueue(AdminAnalyticsActions.channelUsersFetched.matches)
  const instanceUsersFetchedQueue = createActionQueue(AdminAnalyticsActions.instanceUsersFetched.matches)
  const dailyNewUsersFetchedQueue = createActionQueue(AdminAnalyticsActions.dailyNewUsersFetched.matches)
  const dailyUsersFetchedQueue = createActionQueue(AdminAnalyticsActions.dailyUsersFetched.matches)
  const fetchedTestBotsQueue = createActionQueue(AdminTestBotActions.fetchedBots.matches)
  const spawnBotsQueue = createActionQueue(AdminTestBotActions.spawnBots.matches)
  const spawnedBotsQueue = createActionQueue(AdminTestBotActions.spawnedBots.matches)
  const botCommandCreatedQueue = createActionQueue(AdminBotCommandActions.botCommandCreated.matches)
  const botCommandRemovedQueue = createActionQueue(AdminBotCommandActions.botCommandRemoved.matches)
  const fetchedBotQueue = createActionQueue(AdminBotsActions.fetchedBot.matches)
  const botCreatedQueue = createActionQueue(AdminBotsActions.botCreated.matches)
  const botPatchedQueue = createActionQueue(AdminBotsActions.botPatched.matches)
  const botRemovedQueue = createActionQueue(AdminBotsActions.botRemoved.matches)
  const fetchingGroupQueue = createActionQueue(AdminGroupActions.fetchingGroup.matches)
  const setAdminGroupQueue = createActionQueue(AdminGroupActions.setAdminGroup.matches)
  const updateGroupQueue = createActionQueue(AdminGroupActions.updateGroup.matches)
  const removeGroupActionQueue = createActionQueue(AdminGroupActions.removeGroupAction.matches)
  const addAdminGroupQueue = createActionQueue(AdminGroupActions.addAdminGroup.matches)
  const githubAppFetchedQueue = createActionQueue(AdminGithubAppActions.githubAppFetched.matches)
  const installedRoutesRetrievedQueue = createActionQueue(AdminRouteActions.installedRoutesRetrieved.matches)
  const activeRoutesRetrievedQueue = createActionQueue(AdminActiveRouteActions.activeRoutesRetrieved.matches)
  const fetchedSingleUserQueue = createActionQueue(AdminUserActions.fetchedSingleUser.matches)
  const loadedUsersQueue = createActionQueue(AdminUserActions.loadedUsers.matches)
  const userAdminRemovedQueue = createActionQueue(AdminUserActions.userAdminRemoved.matches)
  const userCreatedQueue = createActionQueue(AdminUserActions.userCreated.matches)
  const userPatchedQueue = createActionQueue(AdminUserActions.userPatched.matches)
  const searchedUserQueue = createActionQueue(AdminUserActions.searchedUser.matches)
  const setSkipGuestsQueue = createActionQueue(AdminUserActions.setSkipGuests.matches)
  const resetFilterQueue = createActionQueue(AdminUserActions.resetFilter.matches)
  const fetchedInstanceServerQueue = createActionQueue(InstanceServerSettingActions.fetchedInstanceServer.matches)
  const chargebeeSettingRetrievedQueue = createActionQueue(
    AdminChargebeeSettingActions.chargebeeSettingRetrieved.matches
  )
  const invitesRetrievedQueue = createActionQueue(AdminInviteActions.invitesRetrieved.matches)
  const inviteCreatedQueue = createActionQueue(AdminInviteActions.inviteCreated.matches)
  const invitePatchedQueue = createActionQueue(AdminInviteActions.invitePatched.matches)
  const inviteRemovedQueue = createActionQueue(AdminInviteActions.inviteRemoved.matches)
  // const authSettingRetrievedQueue = createActionQueue(AuthSettingsActions.authSettingRetrieved.matches)
  // const authSettingPatchedQueue = createActionQueue(AuthSettingsActions.authSettingPatched.matches)
  // const fetchedClientQueue = createActionQueue(ClientSettingActions.fetchedClient.matches)
  // const clientSettingPatchedQueue = createActionQueue(ClientSettingActions.clientSettingPatched.matches)

  const execute = () => {
    for (const action of fetchedAnalyticsQueue()) AnalyticsSettingReceptors.fetchedAnalyticsReceptor(action)
    for (const action of redisSettingRetrievedQueue()) RedisSettingReceptors.redisSettingRetrievedReceptor(action)
    for (const action of awsSettingRetrievedQueue()) AwsSettingReceptors.awsSettingRetrievedReceptor(action)
    for (const action of awsSettingPatchedQueue()) AwsSettingReceptors.awsSettingPatchedReceptor(action)
    for (const action of fetchedCoilQueue()) CoilSettingReceptors.fetchedCoilReceptor(action)
    for (const action of fetchedEmailQueue()) EmailSettingReceptors.fetchedEmailReceptor(action)
    for (const action of emailSettingPatchedQueue()) EmailSettingReceptors.emailSettingPatchedReceptor(action)
    for (const action of patchInstanceserverQueue()) InstanceServerSettingReceptors.patchInstanceserverReceptor(action)
    for (const action of patchedInstanceserverQueue())
      InstanceServerSettingReceptors.patchedInstanceserverReceptor(action)
    for (const action of projectSettingFetchedQueue()) ProjectSettingReceptors.projectSettingFetchedReceptor(action)
    for (const action of fetchedSeverInfoQueue()) ServerSettingReceptors.fetchedSeverInfoReceptor(action)
    for (const action of serverSettingPatchedQueue()) ServerSettingReceptors.serverSettingPatchedReceptor(action)
    for (const action of getScopeTypesQueue()) AdminScopeTypeReceptor.getScopeTypesReceptor(action)
    for (const action of instancesRetrievedQueue()) AdminInstanceReceptors.instancesRetrievedReceptor(action)
    for (const action of instanceRemovedQueue()) AdminInstanceReceptors.instanceRemovedReceptor(action)
    for (const action of avatarsFetchedQueue()) AdminAvatarReceptors.avatarsFetchedReceptor(action)
    for (const action of avatarCreatedQueue()) AdminAvatarReceptors.avatarCreatedReceptor(action)
    for (const action of avatarRemovedQueue()) AdminAvatarReceptors.avatarRemovedReceptor(action)
    for (const action of avatarUpdatedQueue()) AdminAvatarReceptors.avatarUpdatedReceptor(action)
    for (const action of resourceFiltersFetchedQueue()) AdminResourceReceptors.resourceFiltersFetchedReceptor(action)
    for (const action of resourcesFetchedQueue()) AdminResourceReceptors.resourcesFetchedReceptor(action)
    for (const action of setSelectedMimeTypesQueue()) AdminResourceReceptors.setSelectedMimeTypesReceptor(action)
    for (const action of setSelectedResourceTypesQueue())
      AdminResourceReceptors.setSelectedResourceTypesReceptor(action)
    for (const action of resourceNeedsUpdateQueue()) AdminResourceReceptors.resourceNeedsUpdateReceptor(action)
    for (const action of resourcesResetFilterQueue()) AdminResourceReceptors.resourcesResetFilterReceptor(action)
    for (const action of scenesFetchedQueue()) AdminSceneReceptors.scenesFetchedReceptor(action)
    for (const action of sceneFetchedQueue()) AdminSceneReceptors.sceneFetchedReceptor(action)
    for (const action of locationsRetrievedQueue()) AdminLocationReceptors.locationsRetrievedReceptor(action)
    for (const action of locationCreatedQueue()) AdminLocationReceptors.locationCreatedReceptor(action)
    for (const action of locationPatchedQueue()) AdminLocationReceptors.locationPatchedReceptor(action)
    for (const action of locationRemovedQueue()) AdminLocationReceptors.locationRemovedReceptor(action)
    for (const action of locationTypesRetrievedQueue()) AdminLocationReceptors.locationTypesRetrievedReceptor(action)
    for (const action of partyRetrievedQueue()) AdminPartyReceptors.partyRetrievedReceptor(action)
    for (const action of partyAdminCreatedQueue()) AdminPartyReceptors.partyAdminCreatedReceptor(action)
    for (const action of partyRemovedQueue()) AdminPartyReceptors.partyRemovedReceptor(action)
    for (const action of partyPatchedQueue()) AdminPartyReceptors.partyPatchedReceptor(action)
    for (const action of activeInstancesFetchedQueue()) AdminAnalyticsReceptors.activeInstancesFetchedReceptor(action)
    for (const action of activePartiesFetchedQueue()) AdminAnalyticsReceptors.activePartiesFetchedReceptor(action)
    for (const action of activeLocationsFetchedQueue()) AdminAnalyticsReceptors.activeLocationsFetchedReceptor(action)
    for (const action of activeScenesFetchedQueue()) AdminAnalyticsReceptors.activeScenesFetchedReceptor(action)
    for (const action of channelUsersFetchedQueue()) AdminAnalyticsReceptors.channelUsersFetchedReceptor(action)
    for (const action of instanceUsersFetchedQueue()) AdminAnalyticsReceptors.instanceUsersFetchedReceptor(action)
    for (const action of dailyNewUsersFetchedQueue()) AdminAnalyticsReceptors.dailyNewUsersFetchedReceptor(action)
    for (const action of dailyUsersFetchedQueue()) AdminAnalyticsReceptors.dailyUsersFetchedReceptor(action)
    for (const action of fetchedTestBotsQueue()) AdminTestBotReceptors.fetchedBotsReceptor(action)
    for (const action of spawnBotsQueue()) AdminTestBotReceptors.spawnBotsReceptor(action)
    for (const action of spawnedBotsQueue()) AdminTestBotReceptors.spawnedBotsReceptor(action)
    for (const action of botCommandCreatedQueue()) AdminBotsCommandReceptors.botCommandCreatedReceptor(action)
    for (const action of botCommandRemovedQueue()) AdminBotsCommandReceptors.botCommandRemovedReceptor(action)
    for (const action of fetchedBotQueue()) AdminBotServiceReceptors.fetchedBotReceptor(action)
    for (const action of botCreatedQueue()) AdminBotServiceReceptors.botCreatedReceptor(action)
    for (const action of botPatchedQueue()) AdminBotServiceReceptors.botPatchedReceptor(action)
    for (const action of botRemovedQueue()) AdminBotServiceReceptors.botRemovedReceptor(action)
    for (const action of fetchingGroupQueue()) AdminGroupServiceReceptors.fetchingGroupReceptor(action)
    for (const action of setAdminGroupQueue()) AdminGroupServiceReceptors.setAdminGroupReceptor(action)
    for (const action of updateGroupQueue()) AdminGroupServiceReceptors.updateGroupReceptor(action)
    for (const action of removeGroupActionQueue()) AdminGroupServiceReceptors.removeGroupActionReceptor(action)
    for (const action of addAdminGroupQueue()) AdminGroupServiceReceptors.addAdminGroupReceptor(action)
    for (const action of githubAppFetchedQueue()) AdminGithubAppReceptors.githubAppFetchedReceptor(action)
    for (const action of installedRoutesRetrievedQueue()) AdminRouteReceptors.installedRoutesRetrievedReceptor(action)
    for (const action of activeRoutesRetrievedQueue()) AdminActiveRouteReceptors.activeRoutesRetrievedReceptor(action)
    for (const action of fetchedSingleUserQueue()) AdminUserReceptors.fetchedSingleUserReceptor(action)
    for (const action of loadedUsersQueue()) AdminUserReceptors.loadedUsersReceptor(action)
    for (const action of userAdminRemovedQueue()) AdminUserReceptors.userAdminRemovedReceptor(action)
    for (const action of userCreatedQueue()) AdminUserReceptors.userCreatedReceptor(action)
    for (const action of userPatchedQueue()) AdminUserReceptors.userPatchedReceptor(action)
    for (const action of searchedUserQueue()) AdminUserReceptors.searchedUserReceptor(action)
    for (const action of setSkipGuestsQueue()) AdminUserReceptors.setSkipGuestsReceptor(action)
    for (const action of resetFilterQueue()) AdminUserReceptors.resetFilterReceptor(action)
    for (const action of fetchedInstanceServerQueue())
      AdminInstanceServerReceptors.fetchedInstanceServerReceptor(action)
    for (const action of chargebeeSettingRetrievedQueue())
      AdminChargebeeReceptors.chargebeeSettingRetrievedReceptor(action)
    for (const action of invitesRetrievedQueue()) AdminInviteReceptors.invitesRetrievedReceptor(action)
    for (const action of inviteCreatedQueue()) AdminInviteReceptors.inviteCreatedReceptor(action)
    for (const action of invitePatchedQueue()) AdminInviteReceptors.invitePatchedReceptor(action)
    for (const action of inviteRemovedQueue()) AdminInviteReceptors.inviteRemovedReceptor(action)
    // for (const action of authSettingRetrievedQueue()) //   AuthSettingsReceptors.authSettingRetrievedReceptor(action)/ }
    // for (const action of authSettingPatchedQueue()) //   AuthSettingsReceptors.authSettingPatchedReceptor(action)/ }
    // for (const action of fetchedClientQueue()) //   ClientSettingReceptors.fetchedClientReceptor(action)/ }
    // for (const action of clientSettingPatchedQueue()) //   ClientSettingReceptors.clientSettingPatchedReceptor(action)/ }
  }

  const cleanup = async () => {
    removeActionQueue(fetchedAnalyticsQueue)
    removeActionQueue(redisSettingRetrievedQueue)
    removeActionQueue(awsSettingRetrievedQueue)
    removeActionQueue(awsSettingPatchedQueue)
    removeActionQueue(fetchedCoilQueue)
    removeActionQueue(fetchedEmailQueue)
    removeActionQueue(emailSettingPatchedQueue)
    removeActionQueue(patchInstanceserverQueue)
    removeActionQueue(patchedInstanceserverQueue)
    removeActionQueue(projectSettingFetchedQueue)
    removeActionQueue(fetchedSeverInfoQueue)
    removeActionQueue(serverSettingPatchedQueue)
    removeActionQueue(getScopeTypesQueue)
    removeActionQueue(instancesRetrievedQueue)
    removeActionQueue(instanceRemovedQueue)
    removeActionQueue(avatarsFetchedQueue)
    removeActionQueue(avatarCreatedQueue)
    removeActionQueue(avatarRemovedQueue)
    removeActionQueue(avatarUpdatedQueue)
    removeActionQueue(resourceFiltersFetchedQueue)
    removeActionQueue(resourcesFetchedQueue)
    removeActionQueue(setSelectedMimeTypesQueue)
    removeActionQueue(setSelectedResourceTypesQueue)
    removeActionQueue(resourceNeedsUpdateQueue)
    removeActionQueue(resourcesResetFilterQueue)
    removeActionQueue(scenesFetchedQueue)
    removeActionQueue(sceneFetchedQueue)
    removeActionQueue(locationsRetrievedQueue)
    removeActionQueue(locationCreatedQueue)
    removeActionQueue(locationPatchedQueue)
    removeActionQueue(locationRemovedQueue)
    removeActionQueue(locationTypesRetrievedQueue)
    removeActionQueue(partyRetrievedQueue)
    removeActionQueue(partyAdminCreatedQueue)
    removeActionQueue(partyRemovedQueue)
    removeActionQueue(partyPatchedQueue)
    removeActionQueue(activeInstancesFetchedQueue)
    removeActionQueue(activePartiesFetchedQueue)
    removeActionQueue(activeLocationsFetchedQueue)
    removeActionQueue(activeScenesFetchedQueue)
    removeActionQueue(channelUsersFetchedQueue)
    removeActionQueue(instanceUsersFetchedQueue)
    removeActionQueue(dailyNewUsersFetchedQueue)
    removeActionQueue(dailyUsersFetchedQueue)
    removeActionQueue(fetchedTestBotsQueue)
    removeActionQueue(spawnBotsQueue)
    removeActionQueue(spawnedBotsQueue)
    removeActionQueue(botCommandCreatedQueue)
    removeActionQueue(botCommandRemovedQueue)
    removeActionQueue(fetchedBotQueue)
    removeActionQueue(botCreatedQueue)
    removeActionQueue(botPatchedQueue)
    removeActionQueue(botRemovedQueue)
    removeActionQueue(fetchingGroupQueue)
    removeActionQueue(setAdminGroupQueue)
    removeActionQueue(updateGroupQueue)
    removeActionQueue(removeGroupActionQueue)
    removeActionQueue(addAdminGroupQueue)
    removeActionQueue(githubAppFetchedQueue)
    removeActionQueue(installedRoutesRetrievedQueue)
    removeActionQueue(activeRoutesRetrievedQueue)
    removeActionQueue(fetchedSingleUserQueue)
    removeActionQueue(loadedUsersQueue)
    removeActionQueue(userAdminRemovedQueue)
    removeActionQueue(userCreatedQueue)
    removeActionQueue(userPatchedQueue)
    removeActionQueue(searchedUserQueue)
    removeActionQueue(setSkipGuestsQueue)
    removeActionQueue(resetFilterQueue)
    removeActionQueue(fetchedInstanceServerQueue)
    removeActionQueue(chargebeeSettingRetrievedQueue)
    removeActionQueue(invitesRetrievedQueue)
    removeActionQueue(inviteCreatedQueue)
    removeActionQueue(invitePatchedQueue)
    removeActionQueue(inviteRemovedQueue)
  }

  return { execute, cleanup }
}
