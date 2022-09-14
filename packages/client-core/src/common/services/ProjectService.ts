import { useEffect } from 'react'

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
    updateNeeded: true,
    rebuilding: true
  })
})

export const ProjectServiceReceptor = (action) => {
  const s = getState(ProjectState)
  matches(action)
    .when(ProjectAction.projectsFetched.matches, (action) => {
      return s.merge({
        projects: action.projectResult,
        updateNeeded: false
      })
    })
    .when(ProjectAction.reloadStatusFetched.matches, (action) => {
      return s.merge({
        rebuilding: action.status
      })
    })
    .when(ProjectAction.patchedProject.matches, (action) => {
      return s.merge({ updateNeeded: true })
    })
}

export const accessProjectState = () => getState(ProjectState)

export const useProjectState = () => useState(accessProjectState())

//Service
export const ProjectService = {
  fetchProjects: async () => {
    const projects = await API.instance.client.service('project').find({ paginate: false, query: { allowed: true } })
    dispatchAction(ProjectAction.projectsFetched({ projectResult: projects.data }))
  },

  // restricted to admin scope
  createProject: async (name: string) => {
    const result = await API.instance.client.service('project').create({ name })
    logger.info({ result }, 'Create project result')
    dispatchAction(ProjectAction.createdProject({}))
    await ProjectService.fetchProjects()
  },

  // restricted to admin scope
  uploadProject: async (url: string, name?: string, reset?: boolean) => {
    const result = await API.instance.client.service('project').update({ url, name, reset })
    logger.info({ result }, 'Upload project result')
    dispatchAction(ProjectAction.postProject({}))
    await API.instance.client.service('project-invalidate').patch({ projectName: name })
    await ProjectService.fetchProjects()
  },

  // restricted to admin scope
  removeProject: async (id: string) => {
    const result = await API.instance.client.service('project').remove(id)
    logger.info({ result }, 'Remove project result')
    await ProjectService.fetchProjects()
  },

  // restricted to admin scope
  checkReloadStatus: async () => {
    const result = await API.instance.client.service('project-build').find()
    logger.info({ result }, 'Check reload projects result')
    dispatchAction(ProjectAction.reloadStatusFetched({ status: result }))
  },

  // restricted to admin scope
  triggerReload: async () => {
    try {
      dispatchAction(ProjectAction.reloadStatusFetched({ status: true }))
      const result = await API.instance.client.service('project-build').patch({ rebuild: true })
      logger.info({ result }, 'Reload projects result')
    } catch (err) {
      logger.error(err, 'Error reload projects result.')
      dispatchAction(ProjectAction.reloadStatusFetched({ status: false }))
    }
  },

  // restricted to admin scope
  invalidateProjectCache: async (projectName: string) => {
    try {
      await API.instance.client.service('project-invalidate').patch({ projectName })
      await ProjectService.fetchProjects()
    } catch (err) {
      logger.error(err, 'Error invalidating project cache.')
    }
  },

  setRepositoryPath: async (id: string, url: string) => {
    try {
      await API.instance.client.service('project').patch(id, {
        repositoryPath: url,
        needsRebuild: true
      })
    } catch (err) {
      logger.error(err, 'Error setting project repository path')
      throw err
    }
  },

  pushProject: async (id: string) => {
    try {
      await API.instance.client.service('project-github-push').patch(id, {})
    } catch (err) {
      logger.error('Error with project push', err)
      throw err
    }
  },

  createPermission: async (userInviteCode: string, projectId: string) => {
    try {
      await API.instance.client.service('project-permission').create({
        inviteCode: userInviteCode,
        projectId: projectId
      })
    } catch (err) {
      logger.error('Error with creating new project-permission', err)
      throw err
    }
  },

  patchPermission: async (id: string, type: string) => {
    try {
      await API.instance.client.service('project-permission').patch(id, {
        type: type
      })
    } catch (err) {
      logger.error('Error with patching project-permission', err)
      throw err
    }
  },

  removePermission: async (id: string) => {
    try {
      await API.instance.client.service('project-permission').remove(id)
    } catch (err) {
      logger.error('Error with removing project-permission', err)
      throw err
    }
  },
  useAPIListeners: () => {
    useEffect(() => {
      // TODO
      // API.instance.client.service('project-build').on('patched', (params) => {
      //   store.dispatch(ProjectAction.buildProgress(params.message))
      // })

      const projectPatchedListener = (params) => {
        dispatchAction(ProjectAction.patchedProject({ project: params.project }))
      }

      API.instance.client.service('project').on('patched', projectPatchedListener)

      return () => {
        API.instance.client.service('project').off('patched', projectPatchedListener)
      }
    }, [])
  }
}

//Action
export class ProjectAction {
  static projectsFetched = defineAction({
    type: 'xre.client.Project.PROJECTS_RETRIEVED' as const,
    projectResult: matches.array as Validator<unknown, ProjectInterface[]>
  })

  static reloadStatusFetched = defineAction({
    type: 'xre.client.Project.RELOAD_STATUS_RETRIEVED' as const,
    status: matches.boolean
  })

  static postProject = defineAction({
    type: 'xre.client.Project.PROJECT_POSTED' as const
  })

  static createdProject = defineAction({
    type: 'xre.client.Project.PROJECT_CREATED' as const
  })

  static patchedProject = defineAction({
    type: 'xre.client.Project.PROJECT_PATCHED' as const,
    project: matches.object as Validator<unknown, ProjectInterface>
  })

  // TODO
  // buildProgress: (message: string) => {
  //   return {
  //     type: 'xre.client.Project.PROJECT_BUILDER_UPDATE' as const,
  //     message
  //   }
  // }
}
