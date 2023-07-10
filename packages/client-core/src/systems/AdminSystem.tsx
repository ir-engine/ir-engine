/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { defineAction, defineActionQueue } from '@etherealengine/hyperflux'

import { AdminActiveRouteActions, AdminActiveRouteReceptors } from '../admin/services/ActiveRouteService'
import { AdminAnalyticsActions, AdminAnalyticsReceptors } from '../admin/services/AnalyticsService'
import { AdminAvatarActions, AdminAvatarReceptors } from '../admin/services/AvatarService'
import { AdminBotCommandActions, AdminBotsCommandReceptors } from '../admin/services/BotsCommand'
import { AdminBotsActions, AdminBotServiceReceptors } from '../admin/services/BotsService'
import { AdminBuildStatusActions, AdminBuildStatusReceptors } from '../admin/services/BuildStatusService'
import { AdminGroupActions, AdminGroupServiceReceptors } from '../admin/services/GroupService'
import { AdminInstanceserverActions, InstanceServerSettingReceptors } from '../admin/services/InstanceserverService'
import {
  AdminInstanceActions,
  AdminInstanceReceptors,
  AdminInstanceUserActions,
  AdminInstanceUserReceptors
} from '../admin/services/InstanceService'
import { AdminInviteActions, AdminInviteReceptors } from '../admin/services/InviteService'
import { AdminLocationActions, AdminLocationReceptors } from '../admin/services/LocationService'
import { AdminPartyActions, AdminPartyReceptors } from '../admin/services/PartyService'
import {
  AdminRecordingReceptors,
  AdminRecordingsActions,
  AdminSingleRecordingReceptors,
  AdminSingleRecordingsActions
} from '../admin/services/RecordingService'
import { AdminResourceActions, AdminResourceReceptors } from '../admin/services/ResourceService'
import { AdminRouteActions, AdminRouteReceptors } from '../admin/services/RouteService'
import { AdminSceneActions, AdminSceneReceptors } from '../admin/services/SceneService'
import { AdminScopeTypeActions, AdminScopeTypeReceptor } from '../admin/services/ScopeTypeService'
import { AdminServerInfoActions, AdminServerInfoReceptors } from '../admin/services/ServerInfoService'
import { AdminServerLogsActions, AdminServerLogsReceptors } from '../admin/services/ServerLogsService'
// import { AuthSettingsActions, AuthSettingsReceptors } from '../admin/services/Setting/AuthSettingService'
import { AdminAwsSettingActions, AwsSettingReceptors } from '../admin/services/Setting/AwsSettingService'
import {
  AdminChargebeeReceptors,
  AdminChargebeeSettingActions
} from '../admin/services/Setting/ChargebeeSettingService'
// import { ClientSettingActions, ClientSettingReceptors } from '../admin/services/Setting/ClientSettingService'
import { AdminCoilSettingActions, CoilSettingReceptors } from '../admin/services/Setting/CoilSettingService'
import { EmailSettingActions, EmailSettingReceptors } from '../admin/services/Setting/EmailSettingService'
import { AdminHelmSettingActions, HelmSettingReceptors } from '../admin/services/Setting/HelmSettingService'
import {
  AdminInstanceServerReceptors,
  InstanceServerSettingActions
} from '../admin/services/Setting/InstanceServerSettingService'
import { AdminProjectSettingsActions, ProjectSettingReceptors } from '../admin/services/Setting/ProjectSettingService'
import { AdminRedisSettingActions, RedisSettingReceptors } from '../admin/services/Setting/RedisSettingService'
import { AdminServerSettingActions, ServerSettingReceptors } from '../admin/services/Setting/ServerSettingService'
import {
  AdminTaskServerSettingActions,
  TaskServerSettingReceptors
} from '../admin/services/Setting/TaskServerSettingsService'
import { AdminTestBotActions, AdminTestBotReceptors } from '../admin/services/TestBotService'
import { AdminUserActions, AdminUserReceptors } from '../admin/services/UserService'

const fetchedTaskServersQueue = defineActionQueue(AdminTaskServerSettingActions.fetchedTaskServers.matches)
const fetchServerInfoRequestedQueue = defineActionQueue(AdminServerInfoActions.fetchServerInfoRequested.matches)
const fetchServerInfoRetrievedQueue = defineActionQueue(AdminServerInfoActions.fetchServerInfoRetrieved.matches)
const serverInfoPodRemovedQueue = defineActionQueue(AdminServerInfoActions.serverInfoPodRemoved.matches)
const fetchServerLogsRequestedQueue = defineActionQueue(AdminServerLogsActions.fetchServerLogsRequested.matches)
const fetchServerLogsRetrievedQueue = defineActionQueue(AdminServerLogsActions.fetchServerLogsRetrieved.matches)
const redisSettingRetrievedQueue = defineActionQueue(AdminRedisSettingActions.redisSettingRetrieved.matches)
const awsSettingRetrievedQueue = defineActionQueue(AdminAwsSettingActions.awsSettingRetrieved.matches)
const awsSettingPatchedQueue = defineActionQueue(AdminAwsSettingActions.awsSettingPatched.matches)
const fetchedCoilQueue = defineActionQueue(AdminCoilSettingActions.fetchedCoil.matches)
const fetchedEmailQueue = defineActionQueue(EmailSettingActions.fetchedEmail.matches)
const emailSettingPatchedQueue = defineActionQueue(EmailSettingActions.emailSettingPatched.matches)
const fetchedHelmQueue = defineActionQueue(AdminHelmSettingActions.helmSettingRetrieved.matches)
const patchedHelmQueue = defineActionQueue(AdminHelmSettingActions.helmSettingPatched.matches)
const fetchedHelmMainVersionsQueue = defineActionQueue(AdminHelmSettingActions.helmMainVersionsRetrieved.matches)
const fetchedHelmBuilderVersionsQueue = defineActionQueue(AdminHelmSettingActions.helmBuilderVersionsRetrieved.matches)
const patchInstanceserverQueue = defineActionQueue(AdminInstanceserverActions.patchInstanceserver.matches)
const patchedInstanceserverQueue = defineActionQueue(AdminInstanceserverActions.patchedInstanceserver.matches)
const projectSettingFetchedQueue = defineActionQueue(AdminProjectSettingsActions.projectSettingFetched.matches)
const fetchedSeverInfoQueue = defineActionQueue(AdminServerSettingActions.fetchedSeverInfo.matches)
const serverSettingPatchedQueue = defineActionQueue(AdminServerSettingActions.serverSettingPatched.matches)
const getScopeTypesQueue = defineActionQueue(AdminScopeTypeActions.getScopeTypes.matches)
const instancesRetrievedQueue = defineActionQueue(AdminInstanceActions.instancesRetrieved.matches)
const instanceRemovedQueue = defineActionQueue(AdminInstanceActions.instanceRemoved.matches)
const userInstanceRetrievedQueue = defineActionQueue(AdminInstanceUserActions.instanceUsersRetrieved.matches)
const avatarsFetchedQueue = defineActionQueue(AdminAvatarActions.avatarsFetched.matches)
const avatarCreatedQueue = defineActionQueue(AdminAvatarActions.avatarCreated.matches)
const avatarRemovedQueue = defineActionQueue(AdminAvatarActions.avatarRemoved.matches)
const avatarUpdatedQueue = defineActionQueue(AdminAvatarActions.avatarUpdated.matches)
const resourceFiltersFetchedQueue = defineActionQueue(AdminResourceActions.resourceFiltersFetched.matches)
const resourcesFetchedQueue = defineActionQueue(AdminResourceActions.resourcesFetched.matches)
const setSelectedMimeTypesQueue = defineActionQueue(AdminResourceActions.setSelectedMimeTypes.matches)
const resourceNeedsUpdateQueue = defineActionQueue(AdminResourceActions.resourceNeedsUpdated.matches)
const resourcesResetFilterQueue = defineActionQueue(AdminResourceActions.resourcesResetFilter.matches)
const scenesFetchedQueue = defineActionQueue(AdminSceneActions.scenesFetched.matches)
const sceneFetchedQueue = defineActionQueue(AdminSceneActions.sceneFetched.matches)
const locationsRetrievedQueue = defineActionQueue(AdminLocationActions.locationsRetrieved.matches)
const locationCreatedQueue = defineActionQueue(AdminLocationActions.locationCreated.matches)
const locationPatchedQueue = defineActionQueue(AdminLocationActions.locationPatched.matches)
const locationRemovedQueue = defineActionQueue(AdminLocationActions.locationRemoved.matches)
const locationTypesRetrievedQueue = defineActionQueue(AdminLocationActions.locationTypesRetrieved.matches)
const partyRetrievedQueue = defineActionQueue(AdminPartyActions.partyRetrieved.matches)
const partyAdminCreatedQueue = defineActionQueue(AdminPartyActions.partyAdminCreated.matches)
const partyRemovedQueue = defineActionQueue(AdminPartyActions.partyRemoved.matches)
const partyPatchedQueue = defineActionQueue(AdminPartyActions.partyPatched.matches)
const activeInstancesFetchedQueue = defineActionQueue(AdminAnalyticsActions.activeInstancesFetched.matches)
const activePartiesFetchedQueue = defineActionQueue(AdminAnalyticsActions.activePartiesFetched.matches)
const activeLocationsFetchedQueue = defineActionQueue(AdminAnalyticsActions.activeLocationsFetched.matches)
const activeScenesFetchedQueue = defineActionQueue(AdminAnalyticsActions.activeScenesFetched.matches)
const channelUsersFetchedQueue = defineActionQueue(AdminAnalyticsActions.channelUsersFetched.matches)
const instanceUsersFetchedQueue = defineActionQueue(AdminAnalyticsActions.instanceUsersFetched.matches)
const dailyNewUsersFetchedQueue = defineActionQueue(AdminAnalyticsActions.dailyNewUsersFetched.matches)
const dailyUsersFetchedQueue = defineActionQueue(AdminAnalyticsActions.dailyUsersFetched.matches)
const fetchedTestBotsQueue = defineActionQueue(AdminTestBotActions.fetchedBots.matches)
const spawnBotsQueue = defineActionQueue(AdminTestBotActions.spawnBots.matches)
const spawnedBotsQueue = defineActionQueue(AdminTestBotActions.spawnedBots.matches)
const botCommandCreatedQueue = defineActionQueue(AdminBotCommandActions.botCommandCreated.matches)
const botCommandRemovedQueue = defineActionQueue(AdminBotCommandActions.botCommandRemoved.matches)
const fetchedBotQueue = defineActionQueue(AdminBotsActions.fetchedBot.matches)
const botCreatedQueue = defineActionQueue(AdminBotsActions.botCreated.matches)
const botPatchedQueue = defineActionQueue(AdminBotsActions.botPatched.matches)
const botRemovedQueue = defineActionQueue(AdminBotsActions.botRemoved.matches)
const fetchingGroupQueue = defineActionQueue(AdminGroupActions.fetchingGroup.matches)
const setAdminGroupQueue = defineActionQueue(AdminGroupActions.setAdminGroup.matches)
const updateGroupQueue = defineActionQueue(AdminGroupActions.updateGroup.matches)
const removeGroupActionQueue = defineActionQueue(AdminGroupActions.removeGroupAction.matches)
const addAdminGroupQueue = defineActionQueue(AdminGroupActions.addAdminGroup.matches)
const installedRoutesRetrievedQueue = defineActionQueue(AdminRouteActions.installedRoutesRetrieved.matches)
const activeRoutesRetrievedQueue = defineActionQueue(AdminActiveRouteActions.activeRoutesRetrieved.matches)
const fetchedSingleUserQueue = defineActionQueue(AdminUserActions.fetchedSingleUser.matches)
const loadedUsersQueue = defineActionQueue(AdminUserActions.loadedUsers.matches)
const userAdminRemovedQueue = defineActionQueue(AdminUserActions.userAdminRemoved.matches)
const userCreatedQueue = defineActionQueue(AdminUserActions.userCreated.matches)
const userPatchedQueue = defineActionQueue(AdminUserActions.userPatched.matches)
const searchedUserQueue = defineActionQueue(AdminUserActions.searchedUser.matches)
const setSkipGuestsQueue = defineActionQueue(AdminUserActions.setSkipGuests.matches)
const resetFilterQueue = defineActionQueue(AdminUserActions.resetFilter.matches)
const fetchedInstanceServerQueue = defineActionQueue(InstanceServerSettingActions.fetchedInstanceServer.matches)
const chargebeeSettingRetrievedQueue = defineActionQueue(AdminChargebeeSettingActions.chargebeeSettingRetrieved.matches)
const invitesRetrievedQueue = defineActionQueue(AdminInviteActions.invitesRetrieved.matches)
const inviteCreatedQueue = defineActionQueue(AdminInviteActions.inviteCreated.matches)
const invitePatchedQueue = defineActionQueue(AdminInviteActions.invitePatched.matches)
const inviteRemovedQueue = defineActionQueue(AdminInviteActions.inviteRemoved.matches)
// const authSettingRetrievedQueue = defineActionQueue(AuthSettingsActions.authSettingRetrieved.matches)
// const authSettingPatchedQueue = defineActionQueue(AuthSettingsActions.authSettingPatched.matches)
// const fetchedClientQueue = defineActionQueue(ClientSettingActions.fetchedClient.matches)
// const clientSettingPatchedQueue = defineActionQueue(ClientSettingActions.clientSettingPatched.matches)
const buildStatusRetrievedQueue = defineActionQueue(AdminBuildStatusActions.fetchBuildStatusRetrieved.matches)
const recordingsRetrievedQueue = defineActionQueue(AdminRecordingsActions.recordingsRetrieved.matches)
const recordingRemovedQueue = defineActionQueue(AdminRecordingsActions.recordingsRemoved.matches)
const singleRecordingRetrievedQueue = defineActionQueue(AdminSingleRecordingsActions.recordingsRetrieved.matches)

const execute = () => {
  for (const action of fetchedTaskServersQueue()) TaskServerSettingReceptors.fetchedTaskServersReceptor(action)
  for (const action of fetchServerInfoRequestedQueue())
    AdminServerInfoReceptors.fetchServerInfoRequestedReceptor(action)
  for (const action of fetchServerInfoRetrievedQueue())
    AdminServerInfoReceptors.fetchServerInfoRetrievedReceptor(action)
  for (const action of serverInfoPodRemovedQueue()) AdminServerInfoReceptors.serverInfoPodRemovedReceptor(action)
  for (const action of fetchServerLogsRequestedQueue())
    AdminServerLogsReceptors.fetchServerLogsRequestedReceptor(action)
  for (const action of fetchServerLogsRetrievedQueue())
    AdminServerLogsReceptors.fetchServerLogsRetrievedReceptor(action)
  for (const action of redisSettingRetrievedQueue()) RedisSettingReceptors.redisSettingRetrievedReceptor(action)
  for (const action of awsSettingRetrievedQueue()) AwsSettingReceptors.awsSettingRetrievedReceptor(action)
  for (const action of awsSettingPatchedQueue()) AwsSettingReceptors.awsSettingPatchedReceptor(action)
  for (const action of fetchedCoilQueue()) CoilSettingReceptors.fetchedCoilReceptor(action)
  for (const action of fetchedEmailQueue()) EmailSettingReceptors.fetchedEmailReceptor(action)
  for (const action of emailSettingPatchedQueue()) EmailSettingReceptors.emailSettingPatchedReceptor(action)
  for (const action of fetchedHelmQueue()) HelmSettingReceptors.helmSettingRetrievedReceptor(action)
  for (const action of patchedHelmQueue()) HelmSettingReceptors.helmSettingPatchedReceptor(action)
  for (const action of fetchedHelmMainVersionsQueue()) HelmSettingReceptors.helmMainVersionsRetrievedReceptor(action)
  for (const action of fetchedHelmBuilderVersionsQueue())
    HelmSettingReceptors.helmBuilderVersionsRetrievedReceptor(action)
  for (const action of patchInstanceserverQueue()) InstanceServerSettingReceptors.patchInstanceserverReceptor(action)
  for (const action of patchedInstanceserverQueue())
    InstanceServerSettingReceptors.patchedInstanceserverReceptor(action)
  for (const action of projectSettingFetchedQueue()) ProjectSettingReceptors.projectSettingFetchedReceptor(action)
  for (const action of fetchedSeverInfoQueue()) ServerSettingReceptors.fetchedSeverInfoReceptor(action)
  for (const action of serverSettingPatchedQueue()) ServerSettingReceptors.serverSettingPatchedReceptor(action)
  for (const action of getScopeTypesQueue()) AdminScopeTypeReceptor.getScopeTypesReceptor(action)
  for (const action of instancesRetrievedQueue()) AdminInstanceReceptors.instancesRetrievedReceptor(action)
  for (const action of instanceRemovedQueue()) AdminInstanceReceptors.instanceRemovedReceptor(action)
  for (const action of userInstanceRetrievedQueue()) AdminInstanceUserReceptors.userInstancesReceivedReceptor(action)
  for (const action of avatarsFetchedQueue()) AdminAvatarReceptors.avatarsFetchedReceptor(action)
  for (const action of avatarCreatedQueue()) AdminAvatarReceptors.avatarCreatedReceptor(action)
  for (const action of avatarRemovedQueue()) AdminAvatarReceptors.avatarRemovedReceptor(action)
  for (const action of avatarUpdatedQueue()) AdminAvatarReceptors.avatarUpdatedReceptor(action)
  for (const action of resourceFiltersFetchedQueue()) AdminResourceReceptors.resourceFiltersFetchedReceptor(action)
  for (const action of resourcesFetchedQueue()) AdminResourceReceptors.resourcesFetchedReceptor(action)
  for (const action of setSelectedMimeTypesQueue()) AdminResourceReceptors.setSelectedMimeTypesReceptor(action)
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
  for (const action of fetchedInstanceServerQueue()) AdminInstanceServerReceptors.fetchedInstanceServerReceptor(action)
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
  for (const action of buildStatusRetrievedQueue()) AdminBuildStatusReceptors.fetchBuildStatusReceptor(action)
  for (const action of recordingsRetrievedQueue()) AdminRecordingReceptors.recordingsRetrievedReceptor(action)
  for (const action of recordingRemovedQueue()) AdminRecordingReceptors.recordingRemovedReceptor(action)
  for (const action of singleRecordingRetrievedQueue())
    AdminSingleRecordingReceptors.singleRecordingFetchedReceptor(action)
}

export const AdminSystem = defineSystem({
  uuid: 'ee.client.AdminSystem',
  execute
})
