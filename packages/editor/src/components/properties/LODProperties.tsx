import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getMutableComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { LODComponent, LODLevel } from '@etherealengine/engine/src/scene/components/LODComponent'
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
      <PaginatedList
        list={entities}
        element={(entity: Entity) => {
          const lodComponent = getMutableComponent(entity, LODComponent)
          return (
            <div>
              <PaginatedList
                list={lodComponent.levels}
                element={(level: State<LODLevel>) => {
                  return (
                    <div>
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
