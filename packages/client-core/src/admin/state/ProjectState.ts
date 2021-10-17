import { createState, useState } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { ProjectActionType } from './ProjectActions'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

export const PROJECT_PAGE_LIMIT = 100

export const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  projects: {
    projects: [] as Array<ProjectInterface>,
    skip: 0,
    limit: PROJECT_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: Date.now()
  }
})

export const receptor = (action: ProjectActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'PROJECTS_RETRIEVED':
        result = action.projectResult
        return s.projects.merge({
          projects: result.data,
          skip: result.skip,
          limit: result.limit,
          total: result.total,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
    }
  }, action.type)
}

export const accessProjectState = () => state

export const useProjectState = () => useState(state) as any as typeof state
