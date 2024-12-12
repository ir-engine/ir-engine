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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { MdDeblur } from 'react-icons/md'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { EditorComponentType, commitProperties, commitProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { loadResource } from '@ir-engine/engine/src/assets/functions/resourceLoaderFunctions'
import {
  Devices,
  Heuristic,
  VariantComponent,
  VariantLevel
} from '@ir-engine/engine/src/scene/components/VariantComponent'
import { State, getState } from '@ir-engine/hyperflux'
import {
  ResourceManager,
  ResourceState,
  ResourceStatus,
  ResourceType
} from '@ir-engine/spatial/src/resources/ResourceState'
import Button from '../../../../primitives/tailwind/Button'
import InputGroup from '../../input/Group'
import ModelInput from '../../input/Model'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import PaginatedList from '../../layout/PaginatedList'

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

  return (
    <NodeEditor
      name={t('editor:properties.variant.name')}
      description={t('editor:properties.variant.description')}
      Icon={VariantNodeEditor.iconComponent}
      {...props}
    >
      <div className="m-4 flex flex-col rounded-lg bg-theme-primary p-4">
        <InputGroup name="lodHeuristic" label={t('editor:properties.variant.heuristic')}>
          <SelectInput
            value={variantComponent.heuristic.value}
            onChange={commitProperty(VariantComponent, 'heuristic')}
            options={[
              { value: Heuristic.DISTANCE, label: t('editor:properties.variant.heuristic-distance') },
              { value: Heuristic.MANUAL, label: t('editor:properties.variant.heuristic-manual') }
              /** @todo device heuristic not currently enabled */
              // { value: Heuristic.DEVICE, label: t('editor:properties.variant.heuristic-device') }
            ]}
          />
        </InputGroup>
        <div className="flex flex-1 justify-center align-middle">
          <Button
            variant="tertiary"
            size="sm"
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
            {t('editor:properties.variant.add-variant')}
          </Button>
        </div>
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
                          { value: Devices.MOBILE, label: t('editor:properties.variant.device-mobile') },
                          { value: Devices.DESKTOP, label: t('editor:properties.variant.device-desktop') },
                          { value: Devices.XR, label: t('editor:properties.variant.device-xr') }
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
                <div className="flex flex-1 justify-center align-middle">
                  <Button
                    variant="tertiary"
                    size="sm"
                    onClick={() =>
                      commitProperties(VariantComponent, {
                        levels: JSON.parse(JSON.stringify(variantComponent.levels.value.filter((_, i) => i !== index)))
                      })
                    }
                  >
                    {t('editor:properties.variant.remove-variant')}
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

VariantNodeEditor.iconComponent = MdDeblur

export default VariantNodeEditor
