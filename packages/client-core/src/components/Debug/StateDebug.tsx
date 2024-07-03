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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { Engine } from '@etherealengine/ecs/src/Engine'
import {
  defineState,
  getMutableState,
  NO_PROXY,
  NO_PROXY_STEALTH,
  StateDefinitions,
  syncStateWithLocalStorage,
  useHookstate
} from '@etherealengine/hyperflux'
import { NetworkState } from '@etherealengine/network'

import styles from './styles.module.scss'

const labelRenderer = (data: Record<string | number, any>) => {
  return (keyPath: (string | number)[], ...args) => {
    const key = keyPath[0]
    if (keyPath.length === 2 && typeof key === 'number') {
      return <strong>{Array.isArray(data[key].type) ? data[key].type[0] : data[key].type}</strong>
    }
    if (keyPath.length === 4 && typeof key === 'number') {
      const actions = data[keyPath[2]].actions
      return <strong>{Array.isArray(actions[key].type) ? actions[key].type[0] : actions[key].type}</strong>
    }
    return <strong>{key}</strong>
  }
}

const StateSearchState = defineState({
  name: 'StateSearchState',
  initial: {
    search: ''
  },
  extension: syncStateWithLocalStorage(['search'])
})

export function StateDebug() {
  useHookstate(getMutableState(ECSState).frameTime).value
  const { t } = useTranslation()

  const stateSearch = useHookstate(getMutableState(StateSearchState).search)

  const state =
    stateSearch.value === ''
      ? Engine.instance.store.stateMap
      : Object.fromEntries(
          Object.entries(Engine.instance.store.stateMap)
            .filter(([key]) => key.toLowerCase().includes(stateSearch.value.toLowerCase()))
            .map(([key, value]) => [key, value.get(NO_PROXY_STEALTH)])
        )

  const actionHistory = [...Engine.instance.store.actions.history].sort((a, b) => a.$time - b.$time)
  const cachedHistory = [...Engine.instance.store.actions.cached].sort((a, b) => a.$time - b.$time)
  const eventSourcedHistory = Object.fromEntries(
    [...StateDefinitions.entries()]
      .filter(([name, state]) => state.receptorActionQueue)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => [key, value.receptorActionQueue!.instance])
  )
  const networks = useHookstate(getMutableState(NetworkState).networks).get(NO_PROXY)

  return (
    <>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.state')}</h1>
        <input
          type="text"
          placeholder="Search..."
          value={stateSearch.value}
          onChange={(e) => stateSearch.set(e.target.value)}
        />
        <JSONTree data={state} />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.eventSourcedState')}</h1>
        <JSONTree
          data={eventSourcedHistory}
          labelRenderer={labelRenderer(eventSourcedHistory)}
          shouldExpandNodeInitially={() => false}
        />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.networks')}</h1>
        <JSONTree data={networks} shouldExpandNodeInitially={() => false} />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.actionsHistory')}</h1>
        <JSONTree
          data={actionHistory}
          labelRenderer={labelRenderer(actionHistory)}
          shouldExpandNodeInitially={() => false}
        />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.actionsCached')}</h1>
        <JSONTree
          data={cachedHistory}
          labelRenderer={labelRenderer(cachedHistory)}
          shouldExpandNodeInitially={() => false}
        />
      </div>
    </>
  )
}
