import { createState, useState } from '@speigg/hookstate'

import { SettingProject } from '@xrengine/common/src/interfaces/SettingProject'
//Action
import { SettingProjectResult } from '@xrengine/common/src/interfaces/SettingProjectResult'

import { AlertService } from '../../../common/services/AlertService'
import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

//State
const state = createState({
  projectSettings: [] as Array<SettingProject>,
  skip: 0,
  limit: 100,
  total: 0,
  updateNeeded: true
})

store.receptors.push((action: ProjectSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'PROJECT_SETTING_FETCHED':
        return s.merge({ projectSettings: action.projectSettingResult.data, updateNeeded: false })
    }
  }, action.type)
})

export const accessProjectSettingState = () => state

export const useProjectSettingState = () => useState(state) as any as typeof state

//Service
export const ProjectSettingService = {
  fetchProjectSetting: async (projectId) => {
    const dispatch = useDispatch()
    {
      try {
        const projectSetting = await client.service('project-setting').find({
          query: {
            projectId: projectId
          }
        })
        dispatch(ProjectSettingAction.projectSettingRetrieved(projectSetting))
      } catch (err) {
        AlertService.dispatchAlertError(err)
      }
    }
  }
}

export const ProjectSettingAction = {
  projectSettingRetrieved: (projectSettingResult: SettingProjectResult) => {
    return {
      type: 'PROJECT_SETTING_FETCHED' as const,
      projectSettingResult: projectSettingResult
    }
  }
}

export type ProjectSettingActionType = ReturnType<typeof ProjectSettingAction[keyof typeof ProjectSettingAction]>
