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
All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { FeathersState } from '@ir-engine/common'
import {
  defineState,
  getMutableState,
  NO_PROXY_STEALTH,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

const labelRenderer = (data: Record<string | number, any>) => {
  return (keyPath: (string | number)[], ...args) => {
    const key = keyPath[0]
    if (keyPath.length === 2 && typeof key === 'number') {
      return <Text fontWeight="medium">{Array.isArray(data[key].type) ? data[key].type[0] : data[key].type}</Text>
    }
    if (keyPath.length === 4 && typeof key === 'number') {
      const actions = data[keyPath[2]].actions
      return (
        <Text fontWeight="medium">{Array.isArray(actions[key].type) ? actions[key].type[0] : actions[key].type}</Text>
      )
    }
    return <Text fontWeight="medium">{key}</Text>
  }
}

const APISearchState = defineState({
  name: 'APISearchState',
  initial: {
    search: ''
  },
  extension: syncStateWithLocalStorage(['search'])
})

export function APIDebug() {
  const { t } = useTranslation()

  const apiSearch = useHookstate(getMutableState(APISearchState).search)
  const apiSearchLowercase = apiSearch.value.toLowerCase()

  const state = Object.fromEntries(
    Object.entries(useMutableState(FeathersState).get(NO_PROXY_STEALTH))
      .map(([key, value]) => {
        const serviceQueries = Object.fromEntries(
          Object.entries(value)
            .map(([queryHash, query]) => {
              const argsString = JSON.stringify(query.query.args)
              return [
                argsString,
                {
                  query: query.query,
                  response: query.response,
                  status: query.status,
                  error: query.error,
                  stack: query.$stack
                }
              ] as const
            })
            .filter(([args]) => args.toLowerCase().includes(apiSearchLowercase))
        )
        return [key, serviceQueries]
      })
      .filter(([key, serviceQueries]) => Object.keys(serviceQueries).length > 0)
  )

  return (
    <div className="m-1 bg-neutral-600 p-1">
      <div className="my-0.5">
        <Text>{t('common:debug.api')}</Text>
        <Input
          type="text"
          placeholder="Search..."
          value={apiSearch.value}
          onChange={(event) => apiSearch.set(event.target.value)}
        />
        <JSONTree data={state} />
      </div>
    </div>
  )
}
