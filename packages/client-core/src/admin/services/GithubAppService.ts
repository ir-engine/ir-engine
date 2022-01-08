import { createState, useState } from '@hookstate/core'

import { GithubAppInterface } from '@xrengine/common/src/interfaces/GithubAppInterface'

import { client } from '../../feathers'
import { store } from '../../store'

export const state = createState({
  repos: [] as Array<GithubAppInterface>,
  updateNeeded: true
})

store.receptors.push((action: GithubAppActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'GITHUBAPP_RETRIEVED':
        return s.merge({
          repos: action.result,
          updateNeeded: false
        })
    }
  }, action.type)
})

export const accessGithubAppState = () => state

export const useGithubAppState = () => useState(state) as any as typeof state

export const GithubAppService = {
  fetchGithubAppRepos: async () => {
    const repos = await client.service('github-app').find()
    store.dispatch(GithubAppAction.GithubAppFetched(repos))
  }
}

export const GithubAppAction = {
  GithubAppFetched: (result: GithubAppInterface[]) => {
    return {
      type: 'GITHUBAPP_RETRIEVED' as const,
      result: result
    }
  }
}

export type GithubAppActionType = ReturnType<typeof GithubAppAction[keyof typeof GithubAppAction]>
