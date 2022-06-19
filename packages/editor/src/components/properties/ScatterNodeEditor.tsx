import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mesh, Object3D, Texture } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  addComponent,
  getComponent,
  getOrAddComponent,
  hasComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { addToEntityTreeMaps, iterateEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import {
  ScatterComponent,
  ScatterMode,
  ScatterStagingComponent,
  ScatterState,
  ScatterUnstagingComponent
} from '@xrengine/engine/src/scene/components/ScatterComponent'
import {
  GRASS_PROPERTIES_DEFAULT_VALUES,
  MESH_PROPERTIES_DEFAULT_VALUES,
  stageScatter
} from '@xrengine/engine/src/scene/functions/loaders/ScatterFunctions'
import { dispatchAction } from '@xrengine/hyperflux'

import { setPropertyOnSelectionEntities } from '../../classes/History'
import { SelectionAction } from '../../services/SelectionServices'
import { PropertiesPanelButton } from '../inputs/Button'
import { ImagePreviewInputGroup } from '../inputs/ImagePreviewInput'
import InputGroup from '../inputs/InputGroup'
import NumericInput from '../inputs/NumericInput'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import ScatterGrassProperties from './ScatterGrassProperties'
import { EditorComponentType, updateProperty } from './Util'

export const ScatterNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const node = props.node
  const scatter = getComponent(entity, ScatterComponent)
  const [state, setState] = useState<ScatterState>(scatter.state)

  const texPath = (tex) => {
    if ((tex as Texture).isTexture) return tex.source.data?.src ?? ''
    if (typeof tex === 'string') return tex
    console.error('unknown texture type for', tex)
  }

  const [height, setHeight] = useState(texPath(scatter.heightMap))
  const [density, setDensity] = useState(texPath(scatter.densityMap))

  function onChangeDensity(val) {
    setDensity(val)
    scatter.densityMap = val
    updateProperty(ScatterComponent, 'densityMap')(val)
  }

  function onChangeHeight(val) {
    setHeight(val)
    scatter.heightMap = val
    updateProperty(ScatterComponent, 'heightMap')(val)
  }

  const initialSurfaces = () => {
    const surfaces: any[] = []
    const eTree = Engine.instance.currentWorld.entityTree
    iterateEntityNode(eTree.rootNode, (eNode) => {
      if (eNode === eTree.rootNode) return
      if (hasComponent(eNode.entity, Object3DComponent)) {
        const obj3d = getComponent(eNode.entity, Object3DComponent).value
        let hasMesh = false
        obj3d.traverse((child: Mesh) => {
          if (child.isMesh) {
            hasMesh = true
          }
        })
        if (hasMesh) {
          surfaces.push({ label: getComponent(eNode.entity, NameComponent)?.name, value: eNode.uuid })
        }
      }
    })
    return surfaces
  }

  let [surfaces, setSurfaces] = useState<any[]>(initialSurfaces())

  const onUnstage = async () => {
    if (!hasComponent(entity, ScatterUnstagingComponent)) {
      addComponent(entity, ScatterUnstagingComponent, {})
    }
    while (scatter.state !== ScatterState.UNSTAGED) {
      await new Promise((resolve) => setTimeout(resolve, Engine.instance.currentWorld.deltaSeconds * 1000))
    }
    setState(ScatterState.UNSTAGED)
  }

  const onStage = async () => {
    if (!hasComponent(entity, ScatterStagingComponent)) {
      addComponent(entity, ScatterStagingComponent, {})
    }
    while (scatter.state !== ScatterState.STAGED) {
      await new Promise((resolve) => setTimeout(resolve, Engine.instance.currentWorld.deltaSeconds * 1000))
    }
    setState(ScatterState.STAGED)
  }

  const onReload = async () => {
    await onUnstage()
    await onStage()
  }

  const onChangeMode = (mode) => {
    if (scatter.mode === mode) return
    const obj3d = getOrAddComponent(entity, Object3DComponent, { value: new Object3D() })
    const uData = obj3d.value.userData
    uData[scatter.mode] = scatter.properties
    let properties
    if (uData[mode] !== undefined) {
      properties = uData[mode]
    } else {
      switch (mode) {
        case ScatterMode.GRASS:
          properties = GRASS_PROPERTIES_DEFAULT_VALUES
          break
        case ScatterMode.MESH:
          properties = MESH_PROPERTIES_DEFAULT_VALUES
          break
      }
    }
    updateProperty(ScatterComponent, 'properties')(properties)
    updateProperty(ScatterComponent, 'mode')(mode)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties:scatter.name')}
      description={t('editor:properties:scatter.description')}
    >
      <span>
        <NumericInputGroup
          name="Instance Count"
          label={t('editor:properties:scatter.lbl-count')}
          smallStep={1}
          mediumStep={10}
          largeStep={100}
          min={0}
          value={scatter.count}
          onChange={updateProperty(ScatterComponent, 'count')}
        />
        <InputGroup name="Target Surface" label={t('editor:properties:scatter.lbl-surface')}>
          <SelectInput
            error={t('editor:properties.scatter.error-surface')}
            placeholder={t('editor:properties.scatter.placeholder-surface')}
            value={scatter.surface}
            onChange={updateProperty(ScatterComponent, 'surface')}
            options={surfaces}
            creatable={false}
            isSearchable={true}
          />
        </InputGroup>
        <InputGroup name="Scatter Mode" label={t('editor:properties:scatter.lbl-mode')}>
          <SelectInput
            value={scatter.mode}
            onChange={onChangeMode}
            options={[
              { label: 'Grass', value: ScatterMode.GRASS },
              { label: 'Mesh', value: ScatterMode.MESH }
            ]}
          />
        </InputGroup>
        <ImagePreviewInputGroup
          name="Height Map"
          label={t('editor:properties.grass.heightMap')}
          onChange={onChangeHeight}
          value={height}
        />
        <NumericInputGroup
          name="Height Map Strength"
          label={t('editor:properties.grass.heightMapStrength')}
          onChange={updateProperty(ScatterComponent, 'heightMapStrength')}
          value={scatter.heightMapStrength}
          min={0}
          max={1}
          smallStep={0.01}
          mediumStep={0.025}
          largeStep={0.1}
        />
        <ImagePreviewInputGroup
          name="Density Map"
          label={t('editor:properties.grass.densityMap')}
          onChange={onChangeDensity}
          value={density}
        />
        <NumericInputGroup
          name="Density Map Strength"
          label={t('editor:properties.grass.densityMapStrength')}
          onChange={updateProperty(ScatterComponent, 'densityMapStrength')}
          value={scatter.densityMapStrength}
          min={0}
          max={1}
          smallStep={0.01}
          mediumStep={0.025}
          largeStep={0.1}
        />
        {scatter.mode === ScatterMode.GRASS && (
          <ScatterGrassProperties
            value={scatter.properties}
            onChange={updateProperty(ScatterComponent, 'properties')}
          />
        )}
      </span>
      {state === ScatterState.UNSTAGED && (
        <PropertiesPanelButton onClick={onStage}>{t('editor:properties:scatter.lbl-load')}</PropertiesPanelButton>
      )}
      {state === ScatterState.STAGING && <p>{t('Loading...')}</p>}
      {state === ScatterState.STAGED && (
        <InputGroup name={t('editor:properties:scatter.lbl-options')}>
          <PropertiesPanelButton onClick={onUnstage}>{t('editor:properties:scatter.lbl-unload')}</PropertiesPanelButton>
          <PropertiesPanelButton onClick={onReload}>{t('editor:properties:scatter.lbl-reload')}</PropertiesPanelButton>
        </InputGroup>
      )}
    </NodeEditor>
  )
}
