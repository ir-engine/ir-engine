import { GithubAppInterface } from '@xrengine/common/src/interfaces/GithubAppInterface'
import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'

const AdminGithubAppState = defineState({
  name: 'AdminGithubAppState',
  initial: () => ({
    repos: [] as Array<GithubAppInterface>,
    updateNeeded: true
  })
})

const githubAppFetchedReceptor = (action: typeof AdminGithubAppActions.githubAppFetched.matches._TYPE) => {
  const state = getState(AdminGithubAppState)
  return state.merge({
    repos: action.result,
    updateNeeded: false
  })
}

export const AdminGithubAppReceptors = {
  githubAppFetchedReceptor
}

export const accessAdminGithubAppState = () => getState(AdminGithubAppState)

export const useAdminGithubAppState = () => useState(accessAdminGithubAppState())

export const GithubAppService = {
  fetchGithubAppRepos: async () => {
    const repos = await API.instance.client.service('github-app').find()
    dispatchAction(AdminGithubAppActions.githubAppFetched({ result: repos }))
  }
}

export class AdminGithubAppActions {
  static githubAppFetched = defineAction({
    type: 'xre.client.AdminGithubApp.GITHUBAPP_RETRIEVED' as const,
    result: matches.array as Validator<unknown, GithubAppInterface[]>
  })
}
