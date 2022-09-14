import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../../API'

export const PROJECT_PAGE_LIMIT = 100

export interface ProjectSettingValue {
  key: string
  value: string
}

const AdminProjectSettingsState = defineState({
  name: 'AdminProjectSettingsState',
  initial: () => ({
    projectSetting: [] as Array<ProjectSettingValue>
  })
})

const projectSettingFetchedReceptor = (
  action: typeof AdminProjectSettingsActions.projectSettingFetched.matches._TYPE
) => {
  const state = getState(AdminProjectSettingsState)
  return state.merge({
    projectSetting: action.projectSettings
  })
}

export const ProjectSettingReceptors = {
  projectSettingFetchedReceptor
}

export const accessProjectSettingState = () => getState(AdminProjectSettingsState)

export const useProjectSettingState = () => useState(accessProjectSettingState())

export const ProjectSettingService = {
  fetchProjectSetting: async (projectId: string) => {
    const projectSettings = await API.instance.client.service('project-setting').find({
      query: {
        $limit: 1,
        id: projectId,
        $select: ['settings']
      }
    })
    dispatchAction(AdminProjectSettingsActions.projectSettingFetched({ projectSettings }))
  },

  // restricted to admin scope
  updateProjectSetting: async (projectId: string, data: ProjectSettingValue[]) => {
    await API.instance.client.service('project-setting').patch(projectId, { settings: JSON.stringify(data) })
    ProjectSettingService.fetchProjectSetting(projectId)
  }
}

export class AdminProjectSettingsActions {
  static projectSettingFetched = defineAction({
    type: 'xre.client.AdminProjectSettings.PROJECT_SETTING_FETCHED' as const,
    projectSettings: matches.array as Validator<unknown, ProjectSettingValue[]>
  })
}
