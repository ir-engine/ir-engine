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

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import {
  getComponent,
  getMutableComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { LODComponent, LODLevel } from '@etherealengine/engine/src/scene/components/LODComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { State } from '@etherealengine/hyperflux'

import DeblurIcon from '@mui/icons-material/Deblur'

import { serializeLOD } from '../../functions/lodsFromModel'
import { Button } from '../inputs/Button'
import InputGroup, { InputGroupContainer } from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import NumericInput from '../inputs/NumericInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import PaginatedList from '../layout/PaginatedList'
import { EditorComponentType } from './Util'

export const LODProperties: EditorComponentType = ({ entity }: { entity: Entity }) => {
  const { t } = useTranslation()

  const lodComponent = useComponent(entity, LODComponent)
  const nameComponent = getComponent(entity, NameComponent)

  const onChangeLevelProperty = useCallback(
    (level: State<any>, property: string) => {
      return (value) => {
        level[property].set(value)
      }
    },
    [entity]
  )
  return (
    <div>
      <h2 className="text-white text-2xl font-bold m-4">LODs</h2>
      <div className="bg-gray-800 rounded-lg p-4 m-4">
        <h2 className="text-white text-xl font-bold mb-4">{nameComponent}</h2>
        <InputGroup name="lodHeuristic" label={t('editor:properties.lod.heuristic')}>
          <SelectInput
            value={lodComponent.lodHeuristic.value}
            onChange={(val: typeof lodComponent.lodHeuristic.value) => lodComponent.lodHeuristic.set(val)}
            options={[
              { value: 'DISTANCE', label: t('editor:properties.lod.heuristic-distance') },
              { value: 'SCENE_SCALE', label: t('editor:properties.lod.heuristic-sceneScale') },
              { value: 'MANUAL', label: t('editor:properties.lod.heuristic-manual') },
              { value: 'DEVICE', label: t('editor:properties.lod.heuristic-device') }
            ]}
          />
        </InputGroup>
        <Button
          onClick={() =>
            lodComponent.levels[lodComponent.levels.length].set({
              distance: 0,
              src: '',
              loaded: false,
              metadata: {},
              model: null
            })
          }
        >
          Add LOD
        </Button>
        <PaginatedList
          options={{ countPerPage: 1 }}
          list={lodComponent.levels}
          element={(level: State<LODLevel>) => {
            return (
              <div className="bg-gray-900 m-2">
                <div style={{ margin: '2em' }}>
                  <InputGroup name="distance" label={t('editor:properties.lod.distance')}>
                    <NumericInput value={level.distance.value} onChange={onChangeLevelProperty(level, 'distance')} />
                  </InputGroup>
                  <InputGroup name="src" label={t('editor:properties.lod.src')}>
                    <ModelInput value={level.src.value} onChange={onChangeLevelProperty(level, 'src')} />
                  </InputGroup>
                  {lodComponent.lodHeuristic.value === 'DEVICE' && (
                    <>
                      <InputGroup name="device" label={t('editor:properties.lod.device')}>
                        <SelectInput
                          value={level.metadata['device'].value}
                          onChange={onChangeLevelProperty(level.metadata, 'device')}
                          options={[
                            { value: 'MOBILE', label: t('editor:properties.lod.device-mobile') },
                            { value: 'DESKTOP', label: t('editor:properties.lod.device-desktop') }
                          ]}
                        />
                      </InputGroup>
                    </>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      const index = lodComponent.levels.indexOf(level)
                      lodComponent.levels.set(lodComponent.levels.value.filter((_, i) => i !== index))
                    }}
                  >
                    Remove
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      const model = getComponent(lodComponent.target.value, ModelComponent)
                      serializeLOD(model.src, entity, level)
                    }}
                  >
                    Serialize
                  </Button>
                </div>
              </div>
            )
          }}
        />
      </div>
    </div>
  )
}

LODProperties.iconComponent = DeblurIcon
