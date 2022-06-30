import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

const logger = multiLogger.child({ component: 'client-core:projects' })

//State
export const PROJECT_PAGE_LIMIT = 100

export const ProjectState = defineState({
  name: 'ProjectState',
  initial: () => ({
    projects: [] as Array<ProjectInterface>,
    updateNeeded: true
  })
})

export const ProjectServiceReceptor = (action) => {
  getState(ProjectState).batch((s) => {
    matches(action).when(ProjectAction.projectsFetched.matches, (action) => {
      return s.merge({
        projects: action.projectResult,
        updateNeeded: false
      })
    })
  })
}

export const accessProjectState = () => getState(ProjectState)

export const useProjectState = () => useState(accessProjectState())

//Service
export const ProjectService = {
  fetchProjects: async () => {
    const projects = await API.instance.client.service('project').find({ paginate: false })
    dispatchAction(ProjectAction.projectsFetched({ projectResult: projects.data }))
  },

  // restricted to admin scope
  createProject: async (name: string) => {
    const result = await API.instance.client.service('project').create({ name })
    logger.info({ result }, 'Create project result')
    dispatchAction(ProjectAction.createdProject())
    ProjectService.fetchProjects()
  },

  // restricted to admin scope
  uploadProject: async (url: string) => {
    const result = await API.instance.client.service('project').update({ url })
    logger.info({ result }, 'Upload project result')
    dispatchAction(ProjectAction.postProject())
    ProjectService.fetchProjects()
  },

  // restricted to admin scope
  removeProject: async (id: string) => {
    const result = await API.instance.client.service('project').remove(id)
    logger.info({ result }, 'Remove project result')
    ProjectService.fetchProjects()
  },

  // restricted to admin scope
  triggerReload: async () => {
    const result = await API.instance.client.service('project-build').patch({ rebuild: true })
    logger.info({ result }, 'Reload project result')
  },

  // restricted to admin scope
  invalidateProjectCache: async (projectName: string) => {
    try {
      await API.instance.client.service('project-invalidate').patch({ projectName })
      ProjectService.fetchProjects()
    } catch (err) {
      logger.error(err, 'Error invalidating project cache.')
    }
  }
}
// TODO
// client.service('project-build').on('patched', (params) => {
//   store.dispatch(ProjectAction.buildProgress(params.message))
// })

//Action
export class ProjectAction {
  static projectsFetched = defineAction({
    type: 'PROJECTS_RETRIEVED' as const,
    projectResult: matches.array as Validator<unknown, ProjectInterface[]>
  })

  static postProject = defineAction({
    type: 'PROJECT_POSTED' as const
  })

  static createdProject = defineAction({
    type: 'PROJECT_CREATED' as const
  })

  // TODO
  // buildProgress: (message: string) => {
  //   return {
  //     type: 'PROJECT_BUILDER_UPDATE' as const,
  //     message
  //   }
  // }
}
