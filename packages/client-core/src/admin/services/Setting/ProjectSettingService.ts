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

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { defineState, getMutableState } from '@etherealengine/hyperflux'

export const PROJECT_PAGE_LIMIT = 100

export interface ProjectSettingValue {
  key: string
  value: string
}

export const AdminProjectSettingsState = defineState({
  name: 'AdminProjectSettingsState',
  initial: () => ({
    projectSetting: [] as Array<ProjectSettingValue>
  })
})

export const ProjectSettingService = {
  fetchProjectSetting: async (projectId: string) => {
    const projectSetting = await Engine.instance.api.service('project-setting').find({
      query: {
        $limit: 1,
        id: projectId,
        $select: ['settings']
      }
    })
    getMutableState(AdminProjectSettingsState).merge({
      projectSetting
    })
  },

  // restricted to admin scope
  updateProjectSetting: async (projectId: string, data: ProjectSettingValue[]) => {
    await Engine.instance.api.service('project-setting').patch(projectId, { settings: JSON.stringify(data) })
    ProjectSettingService.fetchProjectSetting(projectId)
  }
}
