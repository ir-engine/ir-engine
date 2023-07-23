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

import { useEffect } from 'react'

import { BuilderInfo } from '@etherealengine/common/src/interfaces/BuilderInfo'
import { BuilderTag } from '@etherealengine/common/src/interfaces/BuilderTags'
import { ProjectInterface, ProjectUpdateType } from '@etherealengine/common/src/interfaces/ProjectInterface'
import { UpdateProjectInterface } from '@etherealengine/common/src/interfaces/UpdateProjectInterface'
import multiLogger from '@etherealengine/common/src/logger'
import { Validator, matches } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { githubRepoAccessRefreshPath } from '@etherealengine/engine/src/schemas/user/github-repo-access-refresh.schema'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

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
    builderTags: [] as Array<BuilderTag>,
    builderInfo: {
      engineVersion: '',
      engineCommit: ''
    },
    refreshingGithubRepoAccess: false
  })
})

export const ProjectServiceReceptor = (action) => {
  const s = getMutableState(ProjectState)
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
    .when(ProjectAction.builderInfoFetched.matches, (action) => {
      return s.merge({ builderInfo: action.builderInfo })
    })
    .when(ProjectAction.setGithubRepoAccessRefreshing.matches, (action) => {
      return s.merge({ refreshingGithubRepoAccess: action.refreshing })
    })
}

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
    name: string,
    reset: boolean,
    commitSHA: string,
    sourceBranch: string,
    updateType: ProjectUpdateType,
    updateSchedule: string
  ) => {
    const result = await API.instance.client
      .service('project')
      .update({ sourceURL, destinationURL, name, reset, commitSHA, sourceBranch, updateType, updateSchedule })
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
      // TODO #7254
      // API.instance.client.service('project-build').on('patched', (params) => {
      //   store.dispatch(ProjectAction.buildProgress(params.message))
      // })

      const projectPatchedListener = (params) => {
        dispatchAction(ProjectAction.patchedProject({ project: params }))
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

  fetchProjectCommits: async (url: string, branchName: string) => {
    try {
      return API.instance.client.service('project-commits').get(url, {
        query: {
          branchName: branchName
        }
      })
    } catch (err) {
      logger.error('Error with fetching commits for a project', err)
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

  checkUnfetchedCommit: async ({ url, selectedSHA }: { url: string; selectedSHA?: string }) => {
    try {
      return API.instance.client.service('project-check-unfetched-commit').get(url, {
        query: {
          selectedSHA
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

  getBuilderInfo: async () => {
    try {
      const result = await API.instance.client.service('builder-info').get()
      dispatchAction(ProjectAction.builderInfoFetched({ builderInfo: result }))
    } catch (err) {
      logger.error('Error with getting engine info', err)
      throw err
    }
  },

  refreshGithubRepoAccess: async () => {
    try {
      dispatchAction(ProjectAction.setGithubRepoAccessRefreshing({ refreshing: true }))
      await API.instance.client.service(githubRepoAccessRefreshPath).find()
      dispatchAction(ProjectAction.setGithubRepoAccessRefreshing({ refreshing: false }))
      await ProjectService.fetchProjects()
    } catch (err) {
      logger.error('Error with refreshing Github repo access', err)
      throw err
    }
  }
}

//Action
export class ProjectAction {
  static projectsFetched = defineAction({
    type: 'ee.client.Project.PROJECTS_RETRIEVED' as const,
    projectResult: matches.array as Validator<unknown, ProjectInterface[]>
  })

  static reloadStatusFetched = defineAction({
    type: 'ee.client.Project.RELOAD_STATUS_RETRIEVED' as const,
    status: matches.boolean
  })

  static postProject = defineAction({
    type: 'ee.client.Project.PROJECT_POSTED' as const
  })

  static createdProject = defineAction({
    type: 'ee.client.Project.PROJECT_CREATED' as const
  })

  static patchedProject = defineAction({
    type: 'ee.client.Project.PROJECT_PATCHED' as const,
    project: matches.object as Validator<unknown, ProjectInterface>
  })

  static builderTagsFetched = defineAction({
    type: 'ee.client.Project.BUILDER_TAGS_RETRIEVED' as const,
    builderTags: matches.array as Validator<unknown, BuilderTag[]>
  })

  static builderInfoFetched = defineAction({
    type: 'ee.client.project.BUILDER_INFO_FETCHED' as const,
    builderInfo: matches.object as Validator<unknown, BuilderInfo>
  })

  static setGithubRepoAccessRefreshing = defineAction({
    type: 'ee.client.project.SET_ACCESS_REFRESHING' as const,
    refreshing: matches.boolean
  })

  // TODO #7254
  // buildProgress: (message: string) => {
  //   return {
  //     type: 'ee.client.Project.PROJECT_BUILDER_UPDATE' as const,
  //     message
  //   }
  // }
}
