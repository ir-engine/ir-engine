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
import {
  AdminChargebeeReceptors,
  AdminChargebeeSettingActions
} from '../admin/services/Setting/ChargebeeSettingService'
import { EmailSettingActions, EmailSettingReceptors } from '../admin/services/Setting/EmailSettingService'
import { AdminHelmSettingActions, HelmSettingReceptors } from '../admin/services/Setting/HelmSettingService'

const fetchedEmailQueue = defineActionQueue(EmailSettingActions.fetchedEmail.matches)
const emailSettingPatchedQueue = defineActionQueue(EmailSettingActions.emailSettingPatched.matches)
const fetchedHelmQueue = defineActionQueue(AdminHelmSettingActions.helmSettingRetrieved.matches)
const patchedHelmQueue = defineActionQueue(AdminHelmSettingActions.helmSettingPatched.matches)
const fetchedHelmMainVersionsQueue = defineActionQueue(AdminHelmSettingActions.helmMainVersionsRetrieved.matches)
const fetchedHelmBuilderVersionsQueue = defineActionQueue(AdminHelmSettingActions.helmBuilderVersionsRetrieved.matches)
const activeRoutesRetrievedQueue = defineActionQueue(AdminActiveRouteActions.activeRoutesRetrieved.matches)
const chargebeeSettingRetrievedQueue = defineActionQueue(AdminChargebeeSettingActions.chargebeeSettingRetrieved.matches)

const execute = () => {
  for (const action of fetchedEmailQueue()) EmailSettingReceptors.fetchedEmailReceptor(action)
  for (const action of emailSettingPatchedQueue()) EmailSettingReceptors.emailSettingPatchedReceptor(action)
  for (const action of fetchedHelmQueue()) HelmSettingReceptors.helmSettingRetrievedReceptor(action)
  for (const action of patchedHelmQueue()) HelmSettingReceptors.helmSettingPatchedReceptor(action)
  for (const action of fetchedHelmMainVersionsQueue()) HelmSettingReceptors.helmMainVersionsRetrievedReceptor(action)
  for (const action of fetchedHelmBuilderVersionsQueue())
    HelmSettingReceptors.helmBuilderVersionsRetrievedReceptor(action)
  for (const action of activeRoutesRetrievedQueue()) AdminActiveRouteReceptors.activeRoutesRetrievedReceptor(action)
  for (const action of chargebeeSettingRetrievedQueue())
    AdminChargebeeReceptors.chargebeeSettingRetrievedReceptor(action)
}

export const AdminSystem = defineSystem({
  uuid: 'ee.client.AdminSystem',
  execute
})
