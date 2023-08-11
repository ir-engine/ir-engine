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
import { Scene } from 'three'

import {
  getComponent,
  getMutableComponent,
  hasComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import {
  InstancingComponent,
  SampleMode,
  ScatterMode,
  ScatterProperties,
  ScatterState,
  SourceProperties,
  TextureRef,
  VertexProperties
} from '@etherealengine/engine/src/scene/components/InstancingComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import {
  GRASS_PROPERTIES_DEFAULT_VALUES,
  MESH_PROPERTIES_DEFAULT_VALUES
} from '@etherealengine/engine/src/scene/functions/loaders/InstancingFunctions'
import getFirstMesh from '@etherealengine/engine/src/scene/util/getFirstMesh'
import { State, useHookstate } from '@etherealengine/hyperflux'

import AcUnitIcon from '@mui/icons-material/AcUnit'

import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import { TexturePreviewInputGroup } from '../inputs/TexturePreviewInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import InstancingGrassProperties from './InstancingGrassProperties'
import InstancingMeshProperties from './InstancingMeshProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType, traverseScene } from './Util'

export const InstancingNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entityState = useHookstate(props.entity)
  const entity = entityState.value
  const scatterState = useComponent(entity, InstancingComponent)
  const scatter = scatterState.value
  const sampleProps = scatter.sampleProperties as ScatterProperties & VertexProperties
  const updateProperty = useCallback(
    function (_, prop: keyof typeof scatter) {
      const state = scatterState[prop]
      return (val) => {
        state.set(val)
      }
    },
    [entityState]
  )
  const updateSampleProp = useCallback(
    function (prop: keyof (ScatterProperties & VertexProperties)) {
      const updateSampleProps = updateProperty(InstancingComponent, 'sampleProperties')
      return (val) => {
        const sampleProps = { ...scatter.sampleProperties }
        sampleProps[prop] = val
        updateSampleProps(sampleProps)
      }
    },
    [entityState]
  )

  const texPath = (tex: TextureRef) => tex.src

  const height = texPath(sampleProps.heightMap)
  const density = texPath(sampleProps.densityMap)

  function initialSurfaces(): { label: string; value: string }[] {
    const surfaces = traverseScene(
      (eNode) => {
        return {
          label: getComponent(eNode, NameComponent) ?? '',
          value: getComponent(eNode, UUIDComponent)
        }
      },
      (eNode) => {
        if (eNode === entity) return false
        if (hasComponent(eNode, ModelComponent)) {
          const obj3d = getMutableComponent(eNode, ModelComponent).scene.value as Scene | undefined
          if (!obj3d) return false
          const mesh = getFirstMesh(obj3d)
          return !!mesh && mesh.geometry.hasAttribute('uv') && mesh.geometry.hasAttribute('normal')
        }
        return false
      }
    )
    return surfaces
  }

  const surfaces = useHookstate(initialSurfaces())

  const onRestage = () => {
    scatterState.state.set(ScatterState.UNSTAGING)
  }

  const onChangeMode = (mode) => {
    if (scatter.mode === mode) return
    const scene = getMutableComponent(entity, ModelComponent).scene! as any
    if (!scene.value) return
    const uData = JSON.parse(JSON.stringify(scene.userData.value))
    uData[scatter.mode] = scatter.sourceProperties
    let srcProperties
    if (uData[mode] !== undefined) {
      srcProperties = uData[mode]
    } else {
      switch (mode) {
        case ScatterMode.GRASS:
          srcProperties = GRASS_PROPERTIES_DEFAULT_VALUES
          break
        case ScatterMode.MESH:
          srcProperties = MESH_PROPERTIES_DEFAULT_VALUES
          break
      }
    }
    scene.userData.set(uData)
    scatterState.sourceProperties.set(srcProperties)
    scatterState.mode.set(mode)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties:instancing.name')}
      description={t('editor:properties:instancing.description')}
    >
      <span>
        <NumericInputGroup
          name="Instance Count"
          label={t('editor:properties:instancing.count')}
          smallStep={1}
          mediumStep={10}
          largeStep={100}
          min={0}
          value={scatter.count}
          onChange={updateProperty(InstancingComponent, 'count')}
        />
        <InputGroup name="Target Surface" label={t('editor:properties:instancing.lbl-surface')}>
          <SelectInput
            placeholder={t('editor:properties.instancing.placeholder-surface')}
            value={scatterState.surface.value}
            onChange={updateProperty(InstancingComponent, 'surface')}
            options={surfaces.value}
          />
        </InputGroup>
        <InputGroup name="Instancing Mode" label={t('editor:properties:instancing.lbl-mode')}>
          <SelectInput
            value={scatter.mode}
            onChange={onChangeMode}
            options={[
              { label: 'Grass', value: ScatterMode.GRASS },
              { label: 'Mesh', value: ScatterMode.MESH }
            ]}
          />
        </InputGroup>
        <InputGroup name="Sampling Mode" label={t('editor:properties:instancing.samplingMode')}>
          <SelectInput
            value={scatter.sampling}
            onChange={updateProperty(InstancingComponent, 'sampling')}
            options={[
              { label: 'Scatter', value: SampleMode.SCATTER },
              { label: 'Vertices', value: SampleMode.VERTICES },
              { label: 'Nodes', value: SampleMode.NODES }
            ]}
          />
        </InputGroup>
        <CollapsibleBlock label={t('editor:properties.instancing.sampling.properties')}>
          {[SampleMode.SCATTER, SampleMode.VERTICES].includes(scatter.sampling) && (
            <>
              <TexturePreviewInputGroup
                name="Height Map"
                label={t('editor:properties.instancing.sampling.heightMap')}
                onChange={updateSampleProp('heightMap')}
                value={height}
              />
              <NumericInputGroup
                name="Height Map Strength"
                label={t('editor:properties.instancing.sampling.heightMapStrength')}
                onChange={updateSampleProp('heightMapStrength')}
                value={sampleProps.heightMapStrength}
                min={0}
                max={1}
                smallStep={0.01}
                mediumStep={0.025}
                largeStep={0.1}
              />
              <TexturePreviewInputGroup
                name="Density Map"
                label={t('editor:properties.instancing.sampling.densityMap')}
                onChange={updateSampleProp('densityMap')}
                value={density}
              />
              <NumericInputGroup
                name="Density Map Strength"
                label={t('editor:properties.instancing.sampling.densityMapStrength')}
                onChange={updateSampleProp('densityMapStrength')}
                value={sampleProps.densityMapStrength}
                min={0}
                max={1}
                smallStep={0.01}
                mediumStep={0.025}
                largeStep={0.1}
              />
            </>
          )}
        </CollapsibleBlock>
        {scatter.mode === ScatterMode.GRASS && (
          <InstancingGrassProperties
            state={scatterState.sourceProperties as State<SourceProperties>}
            onChange={updateProperty(InstancingComponent, 'sourceProperties')}
          />
        )}
        {scatter.mode === ScatterMode.MESH && (
          <InstancingMeshProperties
            state={scatterState.sourceProperties as State<SourceProperties>}
            onChange={updateProperty(InstancingComponent, 'sourceProperties')}
          />
        )}
      </span>
      {scatter.state === ScatterState.STAGING && <p>{t('Loading...')}</p>}
      {scatter.state === ScatterState.STAGED && (
        <InputGroup name={t('editor:properties:instancing.lbl-options')}>
          <PropertiesPanelButton onClick={onRestage}>
            {t('editor:properties:instancing.lbl-reload')}
          </PropertiesPanelButton>
        </InputGroup>
      )}
    </NodeEditor>
  )
}

InstancingNodeEditor.iconComponent = AcUnitIcon
export default InstancingNodeEditor
