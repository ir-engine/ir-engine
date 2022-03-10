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
  fetchProjectSetting: async (projectName: string, key?: string) => {
    const projects = await client.service('project-setting').find({ projectName, key })
    console.log(projects)
    store.dispatch(ProjectSettingAction.projectSettingFetched(projects.data))
  },

  // restricted to admin scope
  updateProjectSetting: async (projectName: string, data: ProjectSettingValue[]) => {
    const dispatch = useDispatch()
    const result = await client.service('project-setting').update({ projectName, data })
    console.log('Upload project result', result)
    dispatch(ProjectSettingAction.projectSettingUpdated())
    ProjectSettingService.fetchProjectSetting(projectName)
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
