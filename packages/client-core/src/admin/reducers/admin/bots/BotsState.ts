import { BotsActionType } from './BotsActions'
import { createState, useState, none, Downgraded } from '@hookstate/core'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'

export const BOTS_PAGE_LIMIT = 100

const state = createState({
  isLoggedIn: false,
  isProcessing: false,
  error: '',
  authUser: AuthUserSeed,
  user: UserSeed,
  identityProvider: IdentityProviderSeed,
  bots: {
    bots: [],
    skip: 0,
    limit: BOTS_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  },
  botCommand: {
    botCommand: [],
    skip: 0,
    limit: BOTS_PAGE_LIMIT,
    total: 0,
    retrieving: false,
    fetched: false,
    updateNeeded: true,
    lastFetched: new Date()
  }
})

export const adminBotsReducer = (_, action: BotsActionType) => {
  Promise.resolve().then(() => botsReceptor(action))
  return state.attach(Downgraded).value
}

export const botsReceptor = (action: BotsActionType): void => {
  let result
  state.batch((s) => {
    switch (action.type) {
      case 'BOT_ADMIN_DISPLAY':
        s.merge({ error: '' })
        return s.bots.merge({
          bots: result.data,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: new Date()
        })
      case 'BOT_ADMIN_CREATE':
        return s.bots.merge({ updateNeeded: true })
      case 'BOT_COMMAND_ADMIN_CREATE':
        return s.bots.merge({ updateNeeded: true })
      case 'BOT_ADMIN_REMOVE':
        return s.bots.merge({ updateNeeded: true })
      case 'BOT_COMMAND_ADMIN_REMOVE':
        return s.bots.merge({ updateNeeded: true })
      case 'BOT_ADMIN_UPDATE':
        return s.bots.merge({ updateNeeded: true })
    }
  }, action.type)
}

export const accessBotState = () => state
export const useBotState = () => useState(state)
