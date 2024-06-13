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
import { MdDeblur } from 'react-icons/md'

import { AssetExt } from '@etherealengine/common/src/constants/AssetType'
import { getOptionalMutableComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@etherealengine/ecs/src/Entity'
import Center from '@etherealengine/editor/src/components/layout/Center'
import {
  EditorComponentType,
  commitProperties,
  commitProperty
} from '@etherealengine/editor/src/components/properties/Util'
import { AssetLoader } from '@etherealengine/engine/src/assets/classes/AssetLoader'
import { loadResource } from '@etherealengine/engine/src/assets/functions/resourceLoaderFunctions'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { Heuristic, VariantComponent, VariantLevel } from '@etherealengine/engine/src/scene/components/VariantComponent'
import { State, getState, useHookstate } from '@etherealengine/hyperflux'
import {
  ResourceManager,
  ResourceState,
  ResourceStatus,
  ResourceType
} from '@etherealengine/spatial/src/resources/ResourceState'
import Button from '../../../../primitives/tailwind/Button'
import BooleanInput from '../../input/Boolean'
import InputGroup from '../../input/Group'
import ModelInput from '../../input/Model'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import PaginatedList from '../../layout/PaginatedList'
import NodeEditor from '../nodeEditor'

const buildBudgetVariantMetadata = (
  level: VariantLevel,
  signal: AbortSignal,
  callback: (maxTextureSize: number, vertexCount: number) => void
) => {
  const src = level.src
  const resources = getState(ResourceState).resources
  if (resources[src] && resources[src].status == ResourceStatus.Loaded) {
    const metadata = getState(ResourceState).resources[src].metadata as { verts: number; textureWidths: number[] }
    const maxTextureSize = metadata.textureWidths ? Math.max(...metadata.textureWidths) : 0
    const verts = metadata.verts
    callback(maxTextureSize, verts)
    return
  }

  loadResource(
    src,
    ResourceType.GLTF,
    UndefinedEntity,
    () => {
      const metadata = getState(ResourceState).resources[src].metadata as { verts: number; textureWidths: number[] }
      const maxTextureSize = metadata.textureWidths ? Math.max(...metadata.textureWidths) : 0
      const verts = metadata.verts
      callback(maxTextureSize, verts)
      ResourceManager.unload(src, UndefinedEntity)
    },
    () => {},
    (error) => {
      console.warn(
        `VariantNodeEditor:buildBudgetVariantMetadata: error loading ${src} to build variant metadata`,
        error
      )
      callback(0, 0)
    },
    signal
  )
}

export const VariantNodeEditor: EditorComponentType = (props: { entity: Entity }) => {
  const { t } = useTranslation()
  const entity = props.entity
  const variantComponent = useComponent(entity, VariantComponent)
  const previewIndex = useHookstate(0)

  const setPreview = (index: number) => {
    previewIndex.set(index)
    const modelComponent = getOptionalMutableComponent(entity, ModelComponent)
    if (!modelComponent) return
    modelComponent.src.set(variantComponent.levels[index].src.value)
  }

  const updateLevelsForBudget = () => {
    const levels = variantComponent.levels.value
    const srcSet = new Set<string>()
    for (const level of levels) {
      srcSet.add(level.src)
    }

    if (srcSet.size !== levels.length) {
      const newLevels: VariantLevel[] = [...srcSet].map((src) => {
        return {
          src: src,
          metadata: {}
        }
      })
      commitProperties(VariantComponent, { levels: newLevels, heuristic: Heuristic.BUDGET }, [entity])
    } else {
      commitProperty(VariantComponent, 'heuristic')(Heuristic.BUDGET)
    }
  }

  return (
    <NodeEditor
      name={t('editor:properties.variant.name')}
      description={t('editor:properties.variant.description')}
      icon={<VariantNodeEditor.iconComponent />}
      {...props}
    >
      <div className="m-4 flex flex-col rounded-lg bg-theme-primary p-4">
        <InputGroup name="lodHeuristic" label={t('editor:properties.variant.heuristic')}>
          <SelectInput
            value={variantComponent.heuristic.value}
            onChange={(value: Heuristic) => {
              if (value === Heuristic.BUDGET) updateLevelsForBudget()
              else commitProperty(VariantComponent, 'heuristic')(value)
            }}
            options={[
              { value: Heuristic.DISTANCE, label: t('editor:properties.variant.heuristic-distance') },
              { value: Heuristic.SCENE_SCALE, label: t('editor:properties.variant.heuristic-sceneScale') },
              { value: Heuristic.MANUAL, label: t('editor:properties.variant.heuristic-manual') },
              { value: Heuristic.DEVICE, label: t('editor:properties.variant.heuristic-device') },
              { value: Heuristic.BUDGET, label: t('editor:properties.variant.heuristic-budget') }
            ]}
          />
        </InputGroup>
        <div className="flex flex-1 justify-center align-middle">
          <Button
            size="small"
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
        </div>
        {variantComponent.heuristic.value === Heuristic.BUDGET && (
          <InputGroup name="Cast Shadow" label={t('editor:properties.variant.useDistance')}>
            <BooleanInput
              value={variantComponent.useDistance.value}
              onChange={commitProperty(VariantComponent, `useDistance` as any)}
            />
          </InputGroup>
        )}
        <PaginatedList
          options={{ countPerPage: 6 }}
          list={variantComponent.levels}
          element={(level: State<VariantLevel>, index) => {
            return (
              <div className="m-2 flex flex-col gap-1 bg-theme-secondary py-1">
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
                  <BudgetVariantNodeEditor
                    entity={entity}
                    level={level}
                    index={index}
                    useDistance={variantComponent.useDistance.value}
                    preview={index == previewIndex.value}
                    onPreview={() => {
                      setPreview(index)
                    }}
                  />
                )}
                <div className="flex flex-1 justify-center align-middle">
                  <Button
                    size="small"
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

export const BudgetVariantNodeEditor = (props: {
  entity: Entity
  level: State<VariantLevel>
  index: number
  useDistance: boolean
  preview: boolean
  onPreview: (boolean) => void
}) => {
  const { t } = useTranslation()
  const { level, index, useDistance, preview, onPreview } = props
  const src = level.src.value
  const lastSrc = useHookstate(src)

  useEffect(() => {
    if (src === lastSrc.value && level.metadata['vertexCount'].value !== undefined) return
    lastSrc.set(src)

    const assetType = AssetLoader.getAssetType(src)
    if (assetType !== AssetExt.GLB && assetType !== AssetExt.GLTF) return

    const controller = new AbortController()
    buildBudgetVariantMetadata(level.value, controller.signal, (maxTextureSize: number, vertexCount: number) => {
      level.metadata.merge({
        maxTextureSize: maxTextureSize,
        vertexCount: vertexCount
      })
    })

    return () => {
      controller.abort()
    }
  }, [src])

  return (
    <>
      {level.metadata['maxTextureSize'].value !== undefined && (
        <Center>{`${t('editor:properties.variant.textureSize')} ${level.metadata['maxTextureSize'].value}`}</Center>
      )}
      {level.metadata['vertexCount'].value !== undefined && (
        <Center>{`${t('editor:properties.variant.vertexCount')} ${level.metadata['vertexCount'].value}`}</Center>
      )}

      <InputGroup name="Cast Shadow" label={t('editor:properties.variant.preview')}>
        <BooleanInput value={preview} onChange={onPreview} />
      </InputGroup>

      {useDistance && (
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
  )
}

VariantNodeEditor.iconComponent = MdDeblur

export default VariantNodeEditor
