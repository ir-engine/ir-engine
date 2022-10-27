import { useEffect } from 'react'

import { BuilderTag } from '@xrengine/common/src/interfaces/BuilderTags'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { UpdateProjectInterface } from '@xrengine/common/src/interfaces/UpdateProjectInterface'
import multiLogger from '@xrengine/common/src/logger'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from './NotificationService'

const logger = multiLogger.child({ component: 'client-core:projects' })

//State
export const PROJECT_PAGE_LIMIT = 100

export const ProjectState = defineState({
  name: 'ProjectState',
  initial: () => ({
    projects: [] as Array<ProjectInterface>,
    updateNeeded: true,
    rebuilding: true,
    builderTags: [] as Array<BuilderTag>
  })
})

export const ProjectServiceReceptor = (action) => {
  const s = getState(ProjectState)
  matches(action)
    .when(ProjectAction.projectsFetched.matches, (action) => {
      s.projects.set(action.projectResult)
      s.updateNeeded.set(false)
    })
    .when(ProjectAction.reloadStatusFetched.matches, (action) => {
      return s.merge({
        rebuilding: action.status
      })
    })
    .when(ProjectAction.patchedProject.matches, (action) => {
      return s.merge({ updateNeeded: true })
    })
    .when(ProjectAction.builderTagsFetched.matches, (action) => {
      return s.merge({ builderTags: action.builderTags })
    })
}

export const accessProjectState = () => getState(ProjectState)

export const useProjectState = () => useState(accessProjectState())

//Service
export const ProjectService = {
  fetchProjects: async () => {
    const projects = await API.instance.client.service('project').find({ paginate: false, query: { allowed: true } })
    dispatchAction(ProjectAction.projectsFetched({ projectResult: projects.data }))
    for (let error of projects.errors) {
      NotificationService.dispatchNotify(error.message || JSON.stringify(error), { variant: 'error' })
    }
  },

  // restricted to admin scope
  createProject: async (name: string) => {
    const result = await API.instance.client.service('project').create({ name })
    logger.info({ result }, 'Create project result')
    dispatchAction(ProjectAction.createdProject({}))
    await ProjectService.fetchProjects()
  },

  // restricted to admin scope
  uploadProject: async (
    sourceURL: string,
    destinationURL: string,
    name?: string,
    reset?: boolean,
    commitSHA?: string
  ) => {
    const result = await API.instance.client
      .service('project')
      .update({ sourceURL, destinationURL, name, reset, commitSHA })
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
  },

  fetchProjectBranches: async (url: string) => {
    try {
      return API.instance.client.service('project-branches').get(url)
    } catch (err) {
      logger.error('Error with fetching tags for a project', err)
      throw err
    }
  },

  fetchProjectTags: async (url: string, branchName: string) => {
    try {
      return API.instance.client.service('project-tags').get(url, {
        query: {
          branchName: branchName
        }
      })
    } catch (err) {
      logger.error('Error with fetching branches for a project', err)
      throw err
    }
  },

  checkDestinationURLValid: async ({ url, inputProjectURL }: { url: string; inputProjectURL?: string }) => {
    try {
      return API.instance.client.service('project-destination-check').get(url, {
        query: {
          inputProjectURL
        }
      })
    } catch (err) {
      logger.error('Error with checking destination for a project', err)
      throw err
    }
  },

  checkSourceMatchesDestination: async ({
    sourceURL,
    selectedSHA,
    destinationURL,
    existingProject = false
  }: {
    sourceURL: string
    selectedSHA: string
    destinationURL: string
    existingProject: boolean
  }) => {
    try {
      return API.instance.client.service('project-check-source-destination-match').find({
        query: {
          sourceURL,
          selectedSHA,
          destinationURL,
          existingProject
        }
      })
    } catch (err) {
      logger.error('Error with checking source matches destination', err)
      throw err
    }
  },

  updateEngine: async (tag: string, updateProjects: boolean, projectsToUpdate: UpdateProjectInterface[]) => {
    try {
      console.log('projectToUpdate', projectsToUpdate)
      await API.instance.client.service('project-build').patch(
        tag,
        {
          updateProjects,
          projectsToUpdate
        },
        null!
      )
    } catch (err) {
      logger.error('Error with updating engine version', err)
      throw err
    }
  },

  fetchBuilderTags: async () => {
    try {
      const result = await API.instance.client.service('project-builder-tags').find()
      dispatchAction(ProjectAction.builderTagsFetched({ builderTags: result }))
    } catch (err) {
      logger.error('Error with getting builder tags', err)
      throw err
    }
  },

  getEngineVersion: async () => {
    try {
      return API.instance.client.service('builder-version').get()
    } catch (err) {
      logger.error('Error with getting engine version', err)
      throw err
    }
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

  static builderTagsFetched = defineAction({
    type: 'xre.client.Project.BUILDER_TAGS_RETRIEVED' as const,
    builderTags: matches.array as Validator<unknown, BuilderTag[]>
  })

  // TODO
  // buildProgress: (message: string) => {
  //   return {
  //     type: 'xre.client.Project.PROJECT_BUILDER_UPDATE' as const,
  //     message
  //   }
  // }
}
