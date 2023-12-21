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

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import {
  AnimationSystemGroup,
  InputSystemGroup,
  PresentationSystemGroup,
  RootSystemGroup,
  SimulationSystemGroup
} from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { SystemDefinitions, SystemUUID } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import { Color } from 'three'
import styles from './styles.module.scss'

const convertSystemTypeToDesiredType = (record: SystemUUID[], systemUUID: SystemUUID) => {
  const system = SystemDefinitions.get(systemUUID)!

  for (let i = 0; i < system.preSystems.length; i++) {
    convertSystemTypeToDesiredType(record, system.preSystems[i])
  }

  if (system.uuid === RootSystemGroup) {
    convertSystemTypeToDesiredType(record, SimulationSystemGroup)
  }

  record.push(system.uuid)

  for (let i = 0; i < system.subSystems.length; i++) {
    convertSystemTypeToDesiredType(record, system.subSystems[i])
  }

  for (let i = 0; i < system.postSystems.length; i++) {
    convertSystemTypeToDesiredType(record, system.postSystems[i])
  }

  return record
}

const col = new Color()
const col2 = new Color()

const convertSystemExecutionTimeToColor = (systemDuration: number, targetTimestep: number) => {
  if (systemDuration < 1) return 'darkgreen'

  // lerp from green to red based on system duration
  col.setColorName('darkgreen').lerp(col2.setColorName('darkred'), systemDuration / targetTimestep)
  return col.getStyle()
}

export const SystemDebug = () => {
  useHookstate(getMutableState(EngineState).frameTime).value
  const systemPerformanceProfilingEnabled = useHookstate(getMutableState(EngineState).systemPerformanceProfilingEnabled)
  const { t } = useTranslation()

  const dag = {
    input: convertSystemTypeToDesiredType([], InputSystemGroup),
    simulation: convertSystemTypeToDesiredType([], SimulationSystemGroup),
    animation: convertSystemTypeToDesiredType([], AnimationSystemGroup),
    presentation: convertSystemTypeToDesiredType([], PresentationSystemGroup)
  }
  const targetTimestep = getState(EngineState).simulationTimestep / 2

  return (
    <div className={styles.jsonPanel}>
      <h1>{t('common:debug.systems')}</h1>
      <button
        onClick={() => systemPerformanceProfilingEnabled.set((val) => !val)}
        className={styles.flagBtn + (systemPerformanceProfilingEnabled.value ? ' ' + styles.active : '')}
        style={{ width: '100px' }}
      >
        {'Profile'}
      </button>
      <JSONTree
        data={dag}
        valueRenderer={(raw, value, ...keyPath) => {
          const systemUUID = value as SystemUUID
          const system = SystemDefinitions.get(systemUUID)!
          const systemReactor = Engine.instance.activeSystemReactors.get(system.uuid)!

          const renderSystemDuration = () => {
            if (typeof system.systemDuration === 'number') {
              const color = convertSystemExecutionTimeToColor(system.systemDuration, targetTimestep)
              return (
                <span key={' system duration'} style={{ color: color }}>
                  {` ${Math.round(system.systemDuration * 1000) / 1000} ms`}
                </span>
              )
            }
          }

          return (
            <>
              <span style={{ color: 'black' }}>{systemUUID}</span>
              {systemPerformanceProfilingEnabled.value && renderSystemDuration()}
              {systemReactor &&
                systemReactor.errors.map((error, i) => (
                  <span key={'error' + i} style={{ color: 'red' }}>
                    {`${error.name}: ${error.message}`}
                  </span>
                ))}
            </>
          )
        }}
        shouldExpandNodeInitially={() => true}
      />
    </div>
  )
}
