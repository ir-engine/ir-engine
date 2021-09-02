import Immutable from 'immutable'
import { BotsRetrievedResponse } from './actions'
import {
  BOT_ADMIN_DISPLAY,
  BOT_ADMIN_CREATE,
  BOT_COMMAND_ADMIN_CREATE,
  BOT_ADMIN_REMOVE,
  BOT_COMMAND_ADMIN_REMOVE,
  BOT_ADMIN_UPDATE
} from '../../actions'
import { UserSeed } from '@xrengine/common/src/interfaces/User'
import { IdentityProviderSeed } from '@xrengine/common/src/interfaces/IdentityProvider'
import { AuthUserSeed } from '@xrengine/common/src/interfaces/AuthUser'

export const BOTS_PAGE_LIMIT = 100

export const initialBotAdminState = {
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
}
const immutableState = Immutable.fromJS(initialBotAdminState) as any

const adminBotReducer = (state = immutableState, action: any): any => {
  let result, updateMap
  switch (action.type) {
    case BOT_ADMIN_DISPLAY:
      result = (action as BotsRetrievedResponse).bots
      updateMap = new Map(state.get('bots'))
      updateMap.set('bots', result.data)
      updateMap.set('retrieving', false)
      updateMap.set('fetched', true)
      updateMap.set('updateNeeded', false)
      updateMap.set('lastFetched', new Date())
      return state.set('bots', updateMap)
    case BOT_ADMIN_CREATE:
      updateMap = new Map(state.get('bots'))
      updateMap.set('updateNeeded', true)
      return state.set('bots', updateMap)
    case BOT_COMMAND_ADMIN_CREATE:
      const resultCommand = new Map(state.get('bots'))
      resultCommand.set('updateNeeded', true)
      return state.set('bots', resultCommand)
    case BOT_ADMIN_REMOVE:
      const res = new Map(state.get('bots'))
      res.set('updateNeeded', true)
      return state.set('bots', res)
    case BOT_COMMAND_ADMIN_REMOVE:
      const resBotCommmand = new Map(state.get('bots'))
      resBotCommmand.set('updateNeeded', true)
      return state.set('bots', resBotCommmand)
    case BOT_ADMIN_UPDATE:
      const botUpdate = new Map(state.get('bots'))
      botUpdate.set('updateNeeded', true)
      return state.set('bots', botUpdate)
  }
  return state
}

export default adminBotReducer
