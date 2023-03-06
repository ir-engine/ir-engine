import { OEmbed } from '@etherealengine/common/src/interfaces/OEmbed'
import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from './NotificationService'

const logger = multiLogger.child({ component: 'client-core:OEmbedService' })

const OEmbedState = defineState({
  name: 'OEmbedState',
  initial: () => ({
    oEmbed: undefined as OEmbed | undefined,
    pathname: ''
  })
})

export const OEmbedServiceReceptor = (action) => {
  const s = getState(OEmbedState)
  matches(action)
    .when(OEmbedActions.fetchData.matches, (action) => {
      return s.merge({ oEmbed: undefined, pathname: action.pathname })
    })
    .when(OEmbedActions.fetchedData.matches, (action) => {
      if (s.pathname.value === action.pathname) {
        return s.merge({ oEmbed: action.oEmbed })
      }
    })
}

export const accessOEmbedState = () => getState(OEmbedState)

export const useOEmbedState = () => useState(accessOEmbedState())

export const OEmbedService = {
  fetchData: async (pathname: string, queryUrl: string) => {
    try {
      dispatchAction(OEmbedActions.fetchData({ pathname }))
      const oEmbed = (await API.instance.client.service('oembed').find({ query: { url: queryUrl } })) as OEmbed
      dispatchAction(OEmbedActions.fetchedData({ oEmbed, pathname }))
    } catch (err) {
      logger.error(err)
      NotificationService.dispatchNotify(err.message, { variant: 'error' })
    }
  }
}

export class OEmbedActions {
  static fetchData = defineAction({
    type: 'xre.client.OEmbed.FETCH_DATA' as const,
    pathname: matches.string
  })
  static fetchedData = defineAction({
    type: 'xre.client.OEmbed.FETCHED_DATA' as const,
    oEmbed: matches.object as Validator<unknown, OEmbed>,
    pathname: matches.string
  })
}
