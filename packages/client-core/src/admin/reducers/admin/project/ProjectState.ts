import { createState, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'
import { ProjectActionType } from './ProjectActions'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

export const REALITY_PACK_PAGE_LIMIT = 100

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
    limit: REALITY_PACK_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
})

export const adminProjectReducer = (_, action: ProjectActionType) => {
  Promise.resolve().then(() => projectReceptor(action))
  return state.attach(Downgraded).value
}

const projectReceptor = (action: ProjectActionType): any => {
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
          lastFetched: new Date()
        })
    }
  }, action.type)
}

export const accessProjectState = () => state
export const useProjectState = () => useState(state) as any as typeof state
