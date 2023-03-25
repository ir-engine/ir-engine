import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  getComponent,
  getMutableComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { LODComponent, LODLevel } from '@etherealengine/engine/src/scene/components/LODComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { State } from '@etherealengine/hyperflux'

import NumericInputGroup from '../inputs/NumericInputGroup'
import PaginatedList from '../layout/PaginatedList'

export function LODProperties({ entity }: { entity: Entity }) {
  const { t } = useTranslation()
  const entities = LODComponent.lodsByEntity[entity].value

  const onChangeLevelProperty = useCallback((level: State<LODLevel>, property: keyof LODLevel) => {
    return (value) => {
      level[property].set(value)
    }
  }, [])

  if (!entities) return <></>
  return (
    <div>
      <h2 className="text-white text-2xl font-bold mb-4">LODs</h2>
      <PaginatedList
        list={entities}
        element={(entity: Entity) => {
          const lodComponent = getMutableComponent(entity, LODComponent)
          const nameComponent = getComponent(entity, NameComponent)
          return (
            <div className="bg-gray-800 rounded-lg p-4 m-4">
              <h2 className="text-white text-xl font-bold mb-4">{nameComponent}</h2>
              <PaginatedList
                list={lodComponent.levels}
                element={(level: State<LODLevel>) => {
                  return (
                    <div className="bg-gray-900 m-2">
                      <NumericInputGroup
                        label={t('editor:properties.lod.distance')}
                        value={level.distance.value}
                        onChange={onChangeLevelProperty(level, 'distance')}
                      />
                    </div>
                  )
                }}
              />
            </div>
          )
        }}
      />
    </div>
  )
}
