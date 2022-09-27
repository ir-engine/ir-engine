import React, { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mesh, Object3D, Texture } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  addComponent,
  getComponent,
  getOrAddComponent,
  hasComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { iterateEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import {
  InstancingComponent,
  InstancingStagingComponent,
  InstancingUnstagingComponent,
  NodeProperties,
  SampleMode,
  ScatterMode,
  ScatterProperties,
  ScatterState,
  VertexProperties
} from '@xrengine/engine/src/scene/components/InstancingComponent'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import {
  GRASS_PROPERTIES_DEFAULT_VALUES,
  MESH_PROPERTIES_DEFAULT_VALUES
} from '@xrengine/engine/src/scene/functions/loaders/InstancingFunctions'
import getFirstMesh from '@xrengine/engine/src/scene/util/getFirstMesh'

import AcUnitIcon from '@mui/icons-material/AcUnit'

import { PropertiesPanelButton } from '../inputs/Button'
import { ImagePreviewInputGroup } from '../inputs/ImagePreviewInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import { TexturePreviewInputGroup } from '../inputs/TexturePreviewInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import InstancingGrassProperties from './InstancingGrassProperties'
import InstancingMeshProperties from './InstancingMeshProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType, traverseScene, updateProperty } from './Util'

export const InstancingNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const node = props.node
  const scatter = getComponent(entity, InstancingComponent)
  const sampleProps = scatter.sampleProperties as ScatterProperties & VertexProperties & NodeProperties
  function updateSampleProp(prop: keyof (ScatterProperties & VertexProperties & NodeProperties)) {
    return (val) => {
      sampleProps[prop as any] = val
      updateProperty(InstancingComponent, 'sampleProperties')(sampleProps)
    }
  }

  const [state, setState] = useState<ScatterState>(scatter.state)

  const texPath = (tex) => {
    if ((tex as Texture).isTexture) return tex.source.data?.src ?? ''
    if (typeof tex === 'string') return tex
    console.error('unknown texture type for', tex)
  }

  const height = texPath(sampleProps.heightMap)
  const density = texPath(sampleProps.densityMap)

  const initialSurfaces = () => {
    const surfaces: any[] = traverseScene(
      (eNode) => {
        return {
          label: getComponent(eNode.entity, NameComponent)?.name ?? '',
          value: eNode.uuid
        }
      },
      (eNode) => {
        if (eNode === node) return false
        if (hasComponent(eNode.entity, ModelComponent)) {
          const obj3d = getComponent(eNode.entity, ModelComponent).scene.value
          if (!obj3d) return false
          const mesh = getFirstMesh(obj3d)
          return !!mesh && mesh.geometry.hasAttribute('uv') && mesh.geometry.hasAttribute('normal')
        }
        return false
      }
    )
    return surfaces
  }

  let surfaces = initialSurfaces()

  const obj3ds = traverseScene(
    (node) => {
      return {
        label: getComponent(node.entity, NameComponent)?.name,
        value: node.uuid
      }
    },
    (node) => hasComponent(node.entity, ModelComponent)
  )

  const onUnstage = async () => {
    if (!hasComponent(entity, InstancingUnstagingComponent)) {
      addComponent(entity, InstancingUnstagingComponent, {})
    }
    while (scatter.state !== ScatterState.UNSTAGED) {
      await new Promise((resolve) => setTimeout(resolve, Engine.instance.currentWorld.deltaSeconds * 1000))
    }
    setState(ScatterState.UNSTAGED)
  }

  const onStage = async () => {
    if (!hasComponent(entity, InstancingStagingComponent)) {
      addComponent(entity, InstancingStagingComponent, {})
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
    const scene = getComponent(entity, ModelComponent).scene
    const obj3d = scene.value
    if (!obj3d) return
    const uData = JSON.parse(JSON.stringify(obj3d.userData))
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
    scene.merge({ userData: uData })
    updateProperty(InstancingComponent, 'sourceProperties')(srcProperties)
    updateProperty(InstancingComponent, 'mode')(mode)
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
            error={t('editor:properties.instancing.error-surface')}
            placeholder={t('editor:properties.instancing.placeholder-surface')}
            value={scatter.surface}
            onChange={updateProperty(InstancingComponent, 'surface')}
            options={surfaces}
            creatable={false}
            isSearchable={true}
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
            <Fragment>
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
            </Fragment>
          )}
          {scatter.sampling === SampleMode.NODES && (
            <Fragment>
              <InputGroup name="Root" label={t('editor:properties.instancing.sampling.root')}>
                <SelectInput
                  value={sampleProps.root}
                  onChange={updateSampleProp('root')}
                  options={obj3ds}
                  isSearchable={true}
                  creatable={false}
                />
              </InputGroup>
            </Fragment>
          )}
        </CollapsibleBlock>
        {scatter.mode === ScatterMode.GRASS && (
          <InstancingGrassProperties
            value={scatter.sourceProperties}
            onChange={updateProperty(InstancingComponent, 'sourceProperties')}
          />
        )}
        {scatter.mode === ScatterMode.MESH && (
          <InstancingMeshProperties
            value={scatter.sourceProperties}
            onChange={updateProperty(InstancingComponent, 'sourceProperties')}
          />
        )}
      </span>
      {state === ScatterState.UNSTAGED && (
        <PropertiesPanelButton onClick={onStage}>{t('editor:properties:instancing.lbl-load')}</PropertiesPanelButton>
      )}
      {state === ScatterState.STAGING && <p>{t('Loading...')}</p>}
      {state === ScatterState.STAGED && (
        <InputGroup name={t('editor:properties:instancing.lbl-options')}>
          <PropertiesPanelButton onClick={onUnstage}>
            {t('editor:properties:instancing.lbl-unload')}
          </PropertiesPanelButton>
          <PropertiesPanelButton onClick={onReload}>
            {t('editor:properties:instancing.lbl-reload')}
          </PropertiesPanelButton>
        </InputGroup>
      )}
    </NodeEditor>
  )
}

InstancingNodeEditor.iconComponent = AcUnitIcon
export default InstancingNodeEditor
