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

import multiLogger from '@etherealengine/common/src/logger'
import {
  builderInfoPath,
  githubRepoAccessRefreshPath,
  InviteCode,
  projectBranchesPath,
  projectBuilderTagsPath,
  ProjectBuilderTagsType,
  projectBuildPath,
  ProjectBuildUpdateItemType,
  projectCheckSourceDestinationMatchPath,
  projectCheckUnfetchedCommitPath,
  projectCommitsPath,
  projectDestinationCheckPath,
  projectGithubPushPath,
  projectInvalidatePath,
  projectPath,
  projectPermissionPath,
  ProjectType,
  ProjectUpdateParams,
  UserID
} from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { defineState, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useFind, useGet, useService } from '@etherealengine/spatial/src/common/functions/FeathersHooks'

import { NotificationService } from './NotificationService'

const logger = multiLogger.child({ component: 'client-core:projects' })

//State
export const PROJECT_PAGE_LIMIT = 100

export const ProjectState = defineState({
  name: 'ProjectState',
  initial: () => ({
    projects: [] as Array<ProjectType>,
    updateNeeded: true,
    rebuilding: false,
    succeeded: false,
    failed: false,
    builderTags: [] as Array<ProjectBuilderTagsType>,
    builderInfo: {
      engineVersion: '',
      engineCommit: ''
    },
    refreshingGithubRepoAccess: false
  })
})

//Service
export const ProjectService = {
  fetchProjects: () => {
    try {
      const projectsQuery = useFind(projectPath, {
        query: {
          action: 'admin',
          allowed: true
        }
      })

      getMutableState(ProjectState).merge({
        updateNeeded: false,
        projects: projectsQuery.data
      })
    } catch (err) {
      NotificationService.dispatchNotify(err.message || JSON.stringify(err), { variant: 'error' })
    }
  },

  // restricted to admin scope
  createProject: (name: string, params?: ProjectUpdateParams) => {
    const result = useService(projectPath, 'create', {
      name,
      ...params
    })
    logger.info({ result: result.data }, 'Create project result')
    ProjectService.fetchProjects()
  },

  // restricted to admin scope
  uploadProject: (data: ProjectBuildUpdateItemType) => {
    const result = useService(projectPath, 'update', {
      sourceURL: data.sourceURL,
      destinationURL: data.destinationURL,
      name: data.name,
      reset: data.reset,
      commitSHA: data.commitSHA,
      sourceBranch: data.sourceBranch,
      updateType: data.updateType,
      updateSchedule: data.updateSchedule
    })
    logger.info({ result: result.data }, 'Upload project result')
    ProjectService.fetchProjects()
    useService(projectInvalidatePath, 'patch', { projectName: data.name })
  },

  // restricted to admin scope
  removeProject: (id: string, params?: ProjectUpdateParams) => {
    const result = useService(projectPath, 'remove', { id, ...params })
    logger.info({ result: result.data }, 'Remove project result')
    ProjectService.fetchProjects()
  },

  // restricted to admin scope
  checkReloadStatus: () => {
    // TODO: Why useFind return type is not correct?
    const result = useService(projectBuildPath, 'find', {})

    logger.info({ result: result.data }, 'Check reload projects result')
    getMutableState(ProjectState).merge({
      rebuilding: result.data?.running,
      succeeded: result.data?.succeeded,
      failed: result.data?.failed
    })
  },

  // restricted to admin scope
  invalidateProjectCache: (projectName: string) => {
    try {
      useService(projectInvalidatePath, 'patch', { projectName })
      ProjectService.fetchProjects()
    } catch (err) {
      logger.error(err, 'Error invalidating project cache.')
    }
  },

  setEnabled: (id: string, enabled: boolean) => {
    try {
      useService(projectPath, 'patch', { id, enabled })
    } catch (err) {
      logger.error(err, 'Error setting project enabled')
      throw err
    }
  },

  setRepositoryPath: (id: string, url: string) => {
    try {
      useService(projectPath, 'patch', { id, repositoryPath: url })
    } catch (err) {
      logger.error(err, 'Error setting project repository path')
      throw err
    }
  },

  pushProject: (id: string) => {
    try {
      useService(projectGithubPushPath, 'patch', { id })
    } catch (err) {
      logger.error('Error with project push', err)
      throw err
    }
  },

  createPermission: (userInviteCode: InviteCode, projectId: string, type: string) => {
    try {
      const result = useService(projectPermissionPath, 'create', {
        inviteCode: userInviteCode,
        userId: '' as UserID,
        projectId: projectId,
        type
      })
      logger.info({ result: result.data }, 'Create project permission result')
      return result.data
    } catch (err) {
      logger.error('Error with creating new project-permission', err)
      throw err
    }
  },

  patchPermission: (id: string, type: string) => {
    try {
      const result = useService(projectPermissionPath, 'patch', { id, type })
      return result.data
    } catch (err) {
      logger.error('Error with patching project-permission', err)
      throw err
    }
  },

  removePermission: (id: string) => {
    try {
      useService(projectPermissionPath, 'remove', { id })
    } catch (err) {
      logger.error('Error with removing project-permission', err)
      throw err
    }
  },
  useAPIListeners: () => {
    const updateNeeded = useHookstate(getMutableState(ProjectState).updateNeeded)

    useEffect(() => {
      if (updateNeeded.value) ProjectService.fetchProjects()
    }, [updateNeeded])

    useEffect(() => {
      // TODO #7254
      // Engine.instance.api.service(projectBuildPath).on('patched', (params) => {})

      const projectPatchedListener = (params) => {
        getMutableState(ProjectState).updateNeeded.set(true)
      }

      Engine.instance.api.service(projectPath).on('patched', projectPatchedListener)

      return () => {
        Engine.instance.api.service(projectPath).off('patched', projectPatchedListener)
      }
    }, [])
  },

  fetchProjectBranches: (url: string) => {
    try {
      const result = useGet(projectBranchesPath, url)
      const branches = result.data?.branches
      return branches
    } catch (err) {
      logger.error('Error with fetching tags for a project', err)
      throw err
    }
  },

  fetchProjectCommits: (url: string, branchName: string) => {
    try {
      const _result = useService(projectCommitsPath, 'get', {
        url,
        query: {
          sourceBranch: branchName
        }
      })

      return _result.data?.commits
    } catch (err) {
      logger.error('Error with fetching commits for a project', err)
      throw err
    }
  },

  checkDestinationURLValid: ({ url, inputProjectURL }: { url: string; inputProjectURL?: string }) => {
    try {
      const result = useService(projectDestinationCheckPath, 'get', {
        url,
        query: {
          inputProjectURL
        }
      })
      return result.data
    } catch (err) {
      logger.error('Error with checking destination for a project', err)
      throw err
    }
  },

  checkUnfetchedCommit: ({ url, selectedSHA }: { url: string; selectedSHA?: string }) => {
    try {
      const result = useService(projectCheckUnfetchedCommitPath, 'get', {
        url,
        query: {
          selectedSHA
        }
      })
      return result.data
    } catch (err) {
      logger.error('Error with checking destination for a project', err)
      throw err
    }
  },

  checkSourceMatchesDestination: ({
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
      const result = useService(projectCheckSourceDestinationMatchPath, 'find', {
        query: {
          sourceURL,
          selectedSHA,
          destinationURL,
          existingProject
        }
      })
      return result.data
    } catch (err) {
      logger.error('Error with checking source matches destination', err)
      throw err
    }
  },

  updateEngine: (tag: string, updateProjects: boolean, projectsToUpdate: ProjectBuildUpdateItemType[]) => {
    try {
      useService(projectInvalidatePath, 'patch', {
        tag,
        updateProjects,
        projectsToUpdate
      })
    } catch (err) {
      logger.error('Error with updating engine version', err)
      throw err
    }
  },

  fetchBuilderTags: () => {
    try {
      const _result = useFind(projectBuilderTagsPath)
      getMutableState(ProjectState).builderTags.set(_result.data)
    } catch (err) {
      logger.error('Error with getting builder tags', err)
      throw err
    }
  },

  getBuilderInfo: () => {
    try {
      const _result = useGet(builderInfoPath, undefined)
      if (_result.data) {
        getMutableState(ProjectState).builderInfo.set(_result.data)
      }
    } catch (err) {
      logger.error('Error with getting engine info', err)
      throw err
    }
  },

  refreshGithubRepoAccess: () => {
    try {
      getMutableState(ProjectState).refreshingGithubRepoAccess.set(true)
      useFind(githubRepoAccessRefreshPath, {})
      getMutableState(ProjectState).refreshingGithubRepoAccess.set(false)
      ProjectService.fetchProjects()
    } catch (err) {
      logger.error('Error with refreshing Github repo access', err)
      throw err
    }
  }
}
