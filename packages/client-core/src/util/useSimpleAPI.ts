/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import feathers from '@feathersjs/client'
import Primus from 'primus-client'
import { v4 as uuidv4 } from 'uuid'

import primusClient from '@ir-engine/client-core/src/util/primus-client'
import { API } from '@ir-engine/common'
import { EngineState } from '@ir-engine/ecs'
import {
  HyperFlux,
  NO_PROXY,
  UserID,
  defineState,
  getMutableState,
  syncStateWithLocalStorage,
  useHookstate
} from '@ir-engine/hyperflux'
import { useEffect } from 'react'

/**
 * @todo a simple user service to persist userids across refreshes - not secure
 */
const UserState = defineState({
  name: 'ir.client-core.simple-api.UserState',
  initial: {
    userID: '' as UserID
  },
  extension: syncStateWithLocalStorage(['userID'])
})

export const useSimpleAPI = (host: string) => {
  const primus = useHookstate(() => {
    const userID = getMutableState(UserState).userID

    if (!userID.value) userID.set(uuidv4() as UserID)

    getMutableState(EngineState).userID.set(userID.get(NO_PROXY))

    const feathersClient = feathers()

    const query = { peerID: HyperFlux.store.peerID, userID: userID.value }

    const queryString = new URLSearchParams(query).toString()
    const primus = new Primus(`${host}?${queryString}`, {
      withCredentials: false,
      pingInterval: 10000,
      pingTimeout: 30000
    })
    feathersClient.configure(primusClient(primus, { timeout: 10000 }))

    API.instance = feathersClient

    return primus
  })

  useEffect(() => {
    return () => {
      primus.end()
    }
  }, [])
}
