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

export const AdminGithubAppServiceReceptor = (action) => {
  getState(AdminGithubAppState).batch((s) => {
    matches(action).when(GithubAppActions.GithubAppFetched.matches, (action) => {
      return s.merge({
        repos: action.result,
        updateNeeded: false
      })
    })
  })
}

export const accessAdminGithubAppState = () => getState(AdminGithubAppState)

export const useAdminGithubAppState = () => useState(accessAdminGithubAppState())

export const GithubAppService = {
  fetchGithubAppRepos: async () => {
    const repos = await API.instance.client.service('github-app').find()
    dispatchAction(GithubAppActions.GithubAppFetched({ result: repos }))
  }
}

export class GithubAppActions {
  static GithubAppFetched = defineAction({
    type: 'GITHUBAPP_RETRIEVED' as const,
    result: matches.array as Validator<unknown, GithubAppInterface[]>
  })
}
