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
import { getComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { VariantComponent, VariantLevel } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { State } from '@etherealengine/hyperflux'

import DeblurIcon from '@mui/icons-material/Deblur'

import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import SelectInput from '../inputs/SelectInput'
import PaginatedList from '../layout/PaginatedList'
import { EditorComponentType } from './Util'

export const VariantNodeEditor: EditorComponentType = ({ entity }: { entity: Entity }) => {
  const { t } = useTranslation()

  const variantComponent = useComponent(entity, VariantComponent)
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
            value={variantComponent.heuristic.value}
            onChange={(val: typeof variantComponent.heuristic.value) => variantComponent.heuristic.set(val)}
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
            variantComponent.levels[variantComponent.levels.length].set({
              src: '',
              metadata: {}
            })
          }
        >
          Add Variant
        </Button>
        <PaginatedList
          options={{ countPerPage: 6 }}
          list={variantComponent.levels}
          element={(level: State<VariantLevel>) => {
            return (
              <div className="bg-gray-900 m-2">
                <div style={{ margin: '2em' }}>
                  <InputGroup name="src" label={t('editor:properties.lod.src')}>
                    <ModelInput value={level.src.value} onChange={onChangeLevelProperty(level, 'src')} />
                  </InputGroup>
                  {variantComponent.heuristic.value === 'DEVICE' && (
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
                      const index = variantComponent.levels.indexOf(level)
                      variantComponent.levels.set(variantComponent.levels.value.filter((_, i) => i !== index))
                    }}
                  >
                    Remove
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

VariantNodeEditor.iconComponent = DeblurIcon
