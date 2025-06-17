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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { defineSystem, ECSState, PresentationSystemGroup } from '@ir-engine/ecs'
import { getState, NO_PROXY, ReactorRenderCounterState, useHookstate } from '@ir-engine/hyperflux'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import { Dropdown } from '@ir-engine/ui/viewer'
import { useFrameUpdate } from './useFrameUpdate'

let open = false
let accumulator = 0
const updatePeriod = 1 / 50

const timeSeriesWindow = 100
const RenderFrequencyAverage = new Map<string, { lastCount: number; timeseries: number[]; average: number }>()
globalThis.RenderFrequencyAverage = RenderFrequencyAverage

const execute = () => {
  if (!open) return

  // every 100ms, update the render frequency
  const delta = getState(ECSState).deltaSeconds
  accumulator += delta
  if (accumulator > updatePeriod) {
    const state = ReactorRenderCounterState.get(NO_PROXY) as Record<
      string,
      {
        count: number
        name: string
        stack: string[]
        time: number
        lastRender: number
        fiberCount: number
        peakFiberCount: number
      }
    >
    for (const [key, value] of Object.entries(state)) {
      if (value.count > 0) {
        if (!RenderFrequencyAverage.has(key)) {
          RenderFrequencyAverage.set(key, {
            lastCount: value.count,
            timeseries: [],
            average: 0
          })
        }
        const lastCount = RenderFrequencyAverage.get(key)!.lastCount
        RenderFrequencyAverage.get(key)!.lastCount = value.count
        RenderFrequencyAverage.get(key)!.timeseries.push(value.count - lastCount)
        if (RenderFrequencyAverage.get(key)!.timeseries.length > timeSeriesWindow) {
          RenderFrequencyAverage.get(key)!.timeseries.shift()
        }
        RenderFrequencyAverage.get(key)!.average =
          (RenderFrequencyAverage.get(key)!.timeseries.reduce((a, b) => a + b, 0) / timeSeriesWindow) * updatePeriod
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

const sortOptions = [
  {
    label: 'Render Count',
    value: 'renders'
  },
  {
    label: 'Average Render Time',
    value: 'time'
  },
  {
    label: 'Fiber Count',
    value: 'fibers'
  }
]

const shouldExpandNodeInitially = (keyPath: any, data: any, level: number) => level < 2

export function ReactorDebug() {
  const { t } = useTranslation()

  useFrameUpdate()

  const sortBy = useHookstate<'renders' | 'time' | 'fibers'>('renders')

  useEffect(() => {
    open = true
    return () => {
      open = false
    }
  }, [])

  const reactorProfileState = useHookstate(ReactorRenderCounterState)

  const averageEnabled = sortBy.value === 'time'

  // sort by most frequently rendered
  const state = Object.entries(reactorProfileState.get(NO_PROXY))
    .filter(([key, val]) => (averageEnabled ? RenderFrequencyAverage.has(key) : true))
    .sort(([keyA, valA], [keyB, valB]) =>
      sortBy.value === 'time'
        ? RenderFrequencyAverage.get(keyB)!.average - RenderFrequencyAverage.get(keyA)!.average
        : sortBy.value === 'fibers'
        ? valB.peakFiberCount - valA.peakFiberCount
        : valB.count - valA.count
    )
    .map(([key, val]) => {
      return [
        val.name,
        {
          uuid: key,
          renderCount: val.count,
          renderTime: val.time,
          fiberCount: val.fiberCount,
          peakFiberCount: val.peakFiberCount,
          average: RenderFrequencyAverage.get(key)?.average ?? 0,
          stack: val.stack
        }
      ] as const
    })
    .reduce((acc, [key, val]) => {
      acc[key] = val
      return acc
    }, {})

  return (
    <div className="mx-1 my-0.5 bg-neutral-600 p-1">
      <Text className="text-text-primary-button">{t('common:debug.state')}</Text>
      <div className="flex w-full justify-start gap-x-2">
        <div className="text-text-primary-button">Sort</div>
        <Dropdown onChange={(val: any) => sortBy.set(val)} value={sortBy.value} options={sortOptions} />
      </div>
      <JSONTree
        data={state}
        shouldExpandNodeInitially={shouldExpandNodeInitially}
        sortObjectKeys={(a: string, b: string) => {
          const valA = state[a as keyof typeof state] as
            | { average?: number; renderCount?: number; peakFiberCount?: number }
            | undefined
          const valB = state[b as keyof typeof state] as
            | { average?: number; renderCount?: number; peakFiberCount?: number }
            | undefined

          if (!valA || !valB) return a.localeCompare(b)

          return sortBy.value === 'time'
            ? (valB.average || 0) - (valA.average || 0)
            : sortBy.value === 'fibers'
            ? (valB.peakFiberCount || 0) - (valA.peakFiberCount || 0)
            : (valB.renderCount || 0) - (valA.renderCount || 0)
        }}
      />
    </div>
  )
}
