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

import { OEmbed } from '@etherealengine/common/src/interfaces/OEmbed'
import multiLogger from '@etherealengine/common/src/logger'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getMutableState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { NotificationService } from './NotificationService'

const logger = multiLogger.child({ component: 'client-core:OEmbedService' })

export const OEmbedState = defineState({
  name: 'OEmbedState',
  initial: () => ({
    oEmbed: undefined as OEmbed | undefined,
    pathname: ''
  })
})

export const OEmbedServiceReceptor = (action) => {
  const s = getMutableState(OEmbedState)
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
    type: 'ee.client.OEmbed.FETCH_DATA' as const,
    pathname: matches.string
  })
  static fetchedData = defineAction({
    type: 'ee.client.OEmbed.FETCHED_DATA' as const,
    oEmbed: matches.object as Validator<unknown, OEmbed>,
    pathname: matches.string
  })
}
