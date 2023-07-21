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
import { defineActionQueue } from '@etherealengine/hyperflux'

import { AdminActiveRouteActions, AdminActiveRouteReceptors } from '../admin/services/ActiveRouteService'
import { AdminSceneActions, AdminSceneReceptors } from '../admin/services/SceneService'
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

const fetchedTaskServersQueue = defineActionQueue(AdminTaskServerSettingActions.fetchedTaskServers.matches)
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
const projectSettingFetchedQueue = defineActionQueue(AdminProjectSettingsActions.projectSettingFetched.matches)
const fetchedSeverInfoQueue = defineActionQueue(AdminServerSettingActions.fetchedSeverInfo.matches)
const serverSettingPatchedQueue = defineActionQueue(AdminServerSettingActions.serverSettingPatched.matches)
const scenesFetchedQueue = defineActionQueue(AdminSceneActions.scenesFetched.matches)
const sceneFetchedQueue = defineActionQueue(AdminSceneActions.sceneFetched.matches)
const activeRoutesRetrievedQueue = defineActionQueue(AdminActiveRouteActions.activeRoutesRetrieved.matches)
const fetchedInstanceServerQueue = defineActionQueue(InstanceServerSettingActions.fetchedInstanceServer.matches)
const chargebeeSettingRetrievedQueue = defineActionQueue(AdminChargebeeSettingActions.chargebeeSettingRetrieved.matches)
// const authSettingRetrievedQueue = defineActionQueue(AuthSettingsActions.authSettingRetrieved.matches)
// const authSettingPatchedQueue = defineActionQueue(AuthSettingsActions.authSettingPatched.matches)
// const fetchedClientQueue = defineActionQueue(ClientSettingActions.fetchedClient.matches)
// const clientSettingPatchedQueue = defineActionQueue(ClientSettingActions.clientSettingPatched.matches)

const execute = () => {
  for (const action of fetchedTaskServersQueue()) TaskServerSettingReceptors.fetchedTaskServersReceptor(action)
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
  for (const action of projectSettingFetchedQueue()) ProjectSettingReceptors.projectSettingFetchedReceptor(action)
  for (const action of fetchedSeverInfoQueue()) ServerSettingReceptors.fetchedSeverInfoReceptor(action)
  for (const action of serverSettingPatchedQueue()) ServerSettingReceptors.serverSettingPatchedReceptor(action)
  for (const action of scenesFetchedQueue()) AdminSceneReceptors.scenesFetchedReceptor(action)
  for (const action of sceneFetchedQueue()) AdminSceneReceptors.sceneFetchedReceptor(action)
  for (const action of activeRoutesRetrievedQueue()) AdminActiveRouteReceptors.activeRoutesRetrievedReceptor(action)
  for (const action of fetchedInstanceServerQueue()) AdminInstanceServerReceptors.fetchedInstanceServerReceptor(action)
  for (const action of chargebeeSettingRetrievedQueue())
    AdminChargebeeReceptors.chargebeeSettingRetrievedReceptor(action)
  // for (const action of authSettingRetrievedQueue()) //   AuthSettingsReceptors.authSettingRetrievedReceptor(action)/ }
  // for (const action of authSettingPatchedQueue()) //   AuthSettingsReceptors.authSettingPatchedReceptor(action)/ }
  // for (const action of fetchedClientQueue()) //   ClientSettingReceptors.fetchedClientReceptor(action)/ }
  // for (const action of clientSettingPatchedQueue()) //   ClientSettingReceptors.clientSettingPatchedReceptor(action)/ }
}

export const AdminSystem = defineSystem({
  uuid: 'ee.client.AdminSystem',
  execute
})
