import { createState, useState } from '@hookstate/core'
import { ProjectActionType } from './ProjectActions'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

export const PROJECT_PAGE_LIMIT = 100

export const state = createState({
  projects: [] as Array<ProjectInterface>,
  updateNeeded: true
})

export const receptor = (action: ProjectActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'PROJECTS_RETRIEVED':
        result = action.projectResult
        return s.merge({
          projects: action.projectResult,
          updateNeeded: false
        })
    }
  }, action.type)
}

export const accessProjectState = () => state

export const useProjectState = () => useState(state) as any as typeof state
