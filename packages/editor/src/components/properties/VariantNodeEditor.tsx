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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import { Heuristic, VariantComponent, VariantLevel } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { State, getState, useHookstate } from '@etherealengine/hyperflux'

import DeblurIcon from '@mui/icons-material/Deblur'

import { ResourceManager, ResourceState, ResourceType } from '@etherealengine/engine/src/assets/state/ResourceState'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import ModelInput from '../inputs/ModelInput'
import NumericInput from '../inputs/NumericInput'
import SelectInput from '../inputs/SelectInput'
import Center from '../layout/Center'
import PaginatedList from '../layout/PaginatedList'
import NodeEditor from './NodeEditor'
import { EditorComponentType, commitProperties, commitProperty } from './Util'

const buildBudgetVariantMetadata = (
  levels: VariantLevel[],
  index: number,
  callback: (index: number, maxTextureSize: number, vertexCount: number) => void
) => {
  const src = levels[index].src
  ResourceManager.load(
    src,
    ResourceType.GLTF,
    UndefinedEntity,
    {},
    () => {
      const metadata = getState(ResourceState).resources[src].metadata as { verts: number; textureWidths: number[] }
      const maxTextureSize = metadata.textureWidths ? Math.max(...metadata.textureWidths) : 0
      const verts = metadata.verts
      callback(index, maxTextureSize, verts)
      ResourceManager.unload(src, UndefinedEntity)
      if (index < levels.length - 1) buildBudgetVariantMetadata(levels, index + 1, callback)
    },
    () => {},
    (error) => {
      console.warn(
        `VariantNodeEditor:buildBudgetVariantMetadata: error loading ${src} to build variant metadata`,
        error
      )
      callback(levels.length - 1, 0, 0)
    },
    new AbortController().signal
  )
}

export const VariantNodeEditor: EditorComponentType = (props: { entity: Entity }) => {
  const { t } = useTranslation()
  const entity = props.entity
  const variantComponent = useComponent(entity, VariantComponent)
  const buildingMetadata = useHookstate(false)

  useEffect(() => {
    if (variantComponent.heuristic.value === Heuristic.BUDGET) {
      let updateMetadata = false
      for (let i = 0; i < variantComponent.levels.length; i++) {
        const level = variantComponent.levels[i]
        const metadata = level.metadata
        if (metadata['useDistance'].value === undefined) metadata.merge({ useDistance: false })
        if (level.src.value) {
          if (
            metadata['maxTextureSize'].value === undefined ||
            metadata['vertexCount'].value === undefined ||
            metadata['vertexCount'].value === 0
          )
            updateMetadata = true
        }
      }

      if (updateMetadata && !buildingMetadata.value) {
        buildingMetadata.set(true)
        buildBudgetVariantMetadata(
          variantComponent.levels.value,
          0,
          (index: number, maxTextureSize: number, vertexCount: number) => {
            variantComponent.levels[index].metadata.merge({
              maxTextureSize: maxTextureSize,
              vertexCount: vertexCount
            })
            if (index == variantComponent.levels.length - 1) buildingMetadata.set(false)
          }
        )
      }
    }
  })

  return (
    <NodeEditor
      name={t('editor:properties.variant.name')}
      description={t('editor:properties.variant.description')}
      {...props}
    >
      <div className="m-4 rounded-lg bg-gray-800 p-4">
        <InputGroup name="lodHeuristic" label={t('editor:properties.variant.heuristic')}>
          <SelectInput
            value={variantComponent.heuristic.value}
            onChange={commitProperty(VariantComponent, 'heuristic')}
            options={[
              { value: Heuristic.DISTANCE, label: t('editor:properties.variant.heuristic-distance') },
              { value: Heuristic.SCENE_SCALE, label: t('editor:properties.variant.heuristic-sceneScale') },
              { value: Heuristic.MANUAL, label: t('editor:properties.variant.heuristic-manual') },
              { value: Heuristic.DEVICE, label: t('editor:properties.variant.heuristic-device') },
              { value: Heuristic.BUDGET, label: t('editor:properties.variant.heuristic-budget') }
            ]}
          />
        </InputGroup>
        <Button
          onClick={() =>
            commitProperties(
              VariantComponent,
              {
                [`levels.${variantComponent.levels.length}`]: {
                  src: '',
                  metadata: {}
                }
              },
              [entity]
            )
          }
        >
          Add Variant
        </Button>
        <PaginatedList
          options={{ countPerPage: 6 }}
          list={variantComponent.levels}
          element={(level: State<VariantLevel>, index) => {
            return (
              <div className="m-2 bg-gray-900">
                <div style={{ margin: '2em' }}>
                  <InputGroup name="src" label={t('editor:properties.variant.src')}>
                    <ModelInput
                      value={level.src.value}
                      onRelease={commitProperty(VariantComponent, `levels.${index}.src` as any)}
                    />
                  </InputGroup>
                  {variantComponent.heuristic.value === Heuristic.DEVICE && (
                    <>
                      <InputGroup name="device" label={t('editor:properties.variant.device')}>
                        <SelectInput
                          value={level.metadata['device'].value}
                          onChange={commitProperty(VariantComponent, `levels.${index}.metadata.device` as any)}
                          options={[
                            { value: 'MOBILE', label: t('editor:properties.variant.device-mobile') },
                            { value: 'DESKTOP', label: t('editor:properties.variant.device-desktop') },
                            { value: 'XR', label: t('editor:properties.variant.device-xr') }
                          ]}
                        />
                      </InputGroup>
                    </>
                  )}
                  {variantComponent.heuristic.value === Heuristic.DISTANCE && (
                    <>
                      <InputGroup name="minDistance" label={t('editor:properties.variant.minDistance')}>
                        <NumericInput
                          value={level.metadata['minDistance'].value}
                          onChange={commitProperty(VariantComponent, `levels.${index}.metadata.minDistance` as any)}
                        />
                      </InputGroup>
                      <InputGroup name="maxDistance" label={t('editor:properties.variant.maxDistance')}>
                        <NumericInput
                          value={level.metadata['maxDistance'].value}
                          onChange={commitProperty(VariantComponent, `levels.${index}.metadata.maxDistance` as any)}
                        />
                      </InputGroup>
                    </>
                  )}
                  {variantComponent.heuristic.value === Heuristic.BUDGET && (
                    <>
                      {level.metadata['maxTextureSize'].value !== undefined && (
                        <Center>{`${t('editor:properties.variant.textureSize')} ${
                          level.metadata['maxTextureSize'].value
                        }`}</Center>
                      )}
                      {level.metadata['vertexCount'].value !== undefined && (
                        <Center>{`${t('editor:properties.variant.vertexCount')} ${
                          level.metadata['vertexCount'].value
                        }`}</Center>
                      )}
                      {level.metadata['useDistance'].value !== undefined && (
                        <InputGroup name="Cast Shadow" label={t('editor:properties.variant.useDistance')}>
                          <BooleanInput
                            value={level.metadata['useDistance'].value}
                            onChange={commitProperty(VariantComponent, `levels.${index}.metadata.useDistance` as any)}
                          />
                        </InputGroup>
                      )}
                      {level.metadata['useDistance'].value && (
                        <>
                          <InputGroup name="minDistance" label={t('editor:properties.variant.minDistance')}>
                            <NumericInput
                              value={level.metadata['minDistance'].value}
                              onChange={commitProperty(VariantComponent, `levels.${index}.metadata.minDistance` as any)}
                            />
                          </InputGroup>
                          <InputGroup name="maxDistance" label={t('editor:properties.variant.maxDistance')}>
                            <NumericInput
                              value={level.metadata['maxDistance'].value}
                              onChange={commitProperty(VariantComponent, `levels.${index}.metadata.maxDistance` as any)}
                            />
                          </InputGroup>
                        </>
                      )}
                    </>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      commitProperties(VariantComponent, {
                        levels: JSON.parse(JSON.stringify(variantComponent.levels.value.filter((_, i) => i !== index)))
                      })
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            )
          }}
        />
      </div>
    </NodeEditor>
  )
}

VariantNodeEditor.iconComponent = DeblurIcon
