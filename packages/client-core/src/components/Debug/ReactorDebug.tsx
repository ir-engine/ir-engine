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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { defineSystem, ECSState, PresentationSystemGroup } from '@ir-engine/ecs'
import {
  defineState,
  getMutableState,
  getState,
  NO_PROXY,
  ReactorRenderCounterState,
  syncStateWithLocalStorage,
  useHookstate
} from '@ir-engine/hyperflux'
import { Checkbox } from '@ir-engine/ui'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'

const labelRenderer = (data: Record<string | number, any>, total: boolean) => {
  return (keyPath: string[], ...args) => {
    const key = keyPath[0]
    if (!data[key]) return <Text fontWeight="medium">{key}</Text>
    if (total) {
      return (
        <Text fontWeight="medium">
          {data[key].name} - {data[key].count}
        </Text>
      )
    }
    if (!ReactorFrequencyMap.has(key)) {
      return <Text fontWeight="medium">{data[key].name}</Text>
    }
    return (
      <Text fontWeight="medium">
        {data[key].name} - {ReactorFrequencyMap.get(key)?.frequency}/s
      </Text>
    )
  }
}

let open = false
let accumulator = 0

const ReactorFrequencyMap = new Map<string, { lastCount: number; frequency: number }>()
globalThis.ReactorFrequencyMap = ReactorFrequencyMap

globalThis.ReactorRenderCounterState = ReactorRenderCounterState

const execute = () => {
  if (!open) return

  // every 100ms, update the render frequency
  const delta = getState(ECSState).deltaSeconds
  accumulator += delta
  if (accumulator > 0.1) {
    const state = ReactorRenderCounterState.get(NO_PROXY) as Record<
      string,
      { count: number; name: string; stack: string[] }
    >
    for (const [key, value] of Object.entries(state)) {
      const frequency = ReactorFrequencyMap.get(key)
      if (frequency) {
        frequency.frequency = (value.count - frequency.lastCount) / accumulator
        frequency.lastCount = value.count
      } else {
        ReactorFrequencyMap.set(key, { lastCount: value.count, frequency: 0 })
      }
    }
    accumulator = 0
  }
}

const ReactorFrequencySystem = defineSystem({
  uuid: 'ir.client.debug.ReactorFrequencySystem',
  insert: { after: PresentationSystemGroup },
  execute
})

const ReactorSearchState = defineState({
  name: 'ir.client.debug.ReactorSearchState',
  initial: {
    search: ''
  },
  extension: syncStateWithLocalStorage(['search'])
})

export function ReactorDebug() {
  const { t } = useTranslation()
  useHookstate(getMutableState(ECSState).frameTime).value

  const buttonChecked = useHookstate(false)

  useEffect(() => {
    open = true
    return () => {
      open = false
    }
  }, [])

  const reactorProfileState = useHookstate(ReactorRenderCounterState)

  // sort by most frequently rendered
  const state = buttonChecked.value
    ? Object.fromEntries(
        Object.entries(reactorProfileState.get(NO_PROXY))
          .filter(([, a]) => a.count > 1)
          .sort(([, a], [, b]) => b.count - a.count)
      )
    : Object.fromEntries(
        Object.entries(reactorProfileState.get(NO_PROXY))
          .filter(([a]) => ReactorFrequencyMap.has(a)) // && ReactorFrequencyMap.get(a)!.frequency > 0)
          .sort(([a], [b]) => ReactorFrequencyMap.get(b)!.frequency - ReactorFrequencyMap.get(a)!.frequency)
      )

  return (
    <div className="m-1 bg-neutral-600 p-1">
      <div className="my-0.5">
        <Text>{t('common:debug.state')}</Text>
        <Checkbox
          label={buttonChecked.value ? 'Frequency' : 'Total'}
          checked={buttonChecked.value}
          onChange={() => buttonChecked.set(() => !buttonChecked.value)}
        />
        <JSONTree data={state} labelRenderer={labelRenderer(state, buttonChecked.value)} />
      </div>
    </div>
  )
}
