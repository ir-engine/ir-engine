import { createState, useState } from '@speigg/hookstate'

import { client } from '../../../feathers'
import { store, useDispatch } from '../../../store'

//State
export const PROJECT_PAGE_LIMIT = 100

export interface ProjectSettingValue {
  key: string
  value: string
}

export const state = createState({
  projectSetting: [] as Array<ProjectSettingValue>
})

store.receptors.push((action: ProjectSettingActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'PROJECT_SETTING_FETCHED':
        return s.merge({
          projectSetting: action.projectSetting
        })
    }
  }, action.type)
})

export const accessProjectSettingState = () => state

export const useProjectSettingState = () => useState(state) as any as typeof state

//Service
export const ProjectSettingService = {
  fetchProjectSetting: async (projectId: string) => {
    const projectSetting = await client.service('project-setting').find({
      query: {
        $limit: 1,
        id: projectId,
        $select: ['settings']
      }
    })
    store.dispatch(ProjectSettingAction.projectSettingFetched(projectSetting))
  },

  // restricted to admin scope
  updateProjectSetting: async (projectId: string, data: ProjectSettingValue[]) => {
    const dispatch = useDispatch()

    await client.service('project-setting').patch(projectId, { settings: JSON.stringify(data) })

    dispatch(ProjectSettingAction.projectSettingUpdated())
    ProjectSettingService.fetchProjectSetting(projectId)
  }
}

//Action
export const ProjectSettingAction = {
  projectSettingFetched: (projectSetting: ProjectSettingValue[]) => {
    return {
      type: 'PROJECT_SETTING_FETCHED' as const,
      projectSetting: projectSetting
    }
  },
  projectSettingUpdated: () => {
    return {
      type: 'PROJECT_SETTING_UPDATED' as const
    }
  }
}

export type ProjectSettingActionType = ReturnType<typeof ProjectSettingAction[keyof typeof ProjectSettingAction]>
