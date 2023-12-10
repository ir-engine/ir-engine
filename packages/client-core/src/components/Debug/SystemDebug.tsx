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
