import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { DoubleSide, Mesh, MeshStandardMaterial } from 'three'

import { API } from '@xrengine/client-core/src/API'
import { FileBrowserService } from '@xrengine/client-core/src/common/services/FileBrowserService'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { ModelTransformParameters } from '@xrengine/engine/src/assets/classes/ModelTransform'
import { AssetClass } from '@xrengine/engine/src/assets/enum/AssetClass'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import {
  ComponentType,
  getComponent,
  getComponentState,
  hasComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { MaterialSource, SourceType } from '@xrengine/engine/src/renderer/materials/components/MaterialSource'
import MeshBasicMaterial from '@xrengine/engine/src/renderer/materials/constants/material-prototypes/MeshBasicMaterial.mat'
import bakeToVertices from '@xrengine/engine/src/renderer/materials/functions/bakeToVertices'
import { batchSetMaterialProperty } from '@xrengine/engine/src/renderer/materials/functions/batchEditMaterials'
import { materialsFromSource } from '@xrengine/engine/src/renderer/materials/functions/Utilities'
import { ModelComponent } from '@xrengine/engine/src/scene/components/ModelComponent'
import { getState, useHookstate } from '@xrengine/hyperflux'
import { State } from '@xrengine/hyperflux/functions/StateFunctions'

import { ToggleButton } from '@mui/material'

import exportGLTF from '../../functions/exportGLTF'
import { accessSelectionState } from '../../services/SelectionServices'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import TexturePreviewInput from '../inputs/TexturePreviewInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import LightmapBakerProperties from './LightmapBakerProperties'

const TransformContainer = (styled as any).div`
  color: var(--textColor);
  text-align: -webkit-center;
  margin-top: 2em;
  margin-bottom: 4em;
  background-color: var(--background2);
  overflow: scroll;
`

const ElementsContainer = (styled as any).div`
  margin: 16px;
  padding: 8px;
  color: var(--textColor);
`

const FilterToggle = styled(ToggleButton)`
  color: var(--textColor);
`

const OptimizeButton = styled(Button)`
  @keyframes glowing {
    0% {
      background-color: #f00;
      box-shadow: 0 0 5px #f00;
    }
    16% {
      background-color: #ff0;
      box-shadow: 0 0 20px #ff0;
    }
    33% {
      background-color: #0f0;
      box-shadow: 0 0 5px #0f0;
    }
    50% {
      background-color: #0ff;
      box-shadow: 0 0 20px #0ff;
    }
    66% {
      background-color: #00f;
      box-shadow: 0 0 5px #00f;
    }
    83% {
      background-color: #f0f;
      box-shadow: 0 0 20px #f0f;
    }
    100% {
      background-color: #f00;
      box-shadow: 0 0 5px #f00;
    }
  }
  animation: glowing 5000ms infinite;

  &:hover {
    animation: glowing 250ms infinite;
  }
`

export default function ModelTransformProperties({
  modelState,
  onChangeModel
}: {
  modelState: State<ComponentType<typeof ModelComponent>>
  onChangeModel: any
}) {
  const { t } = useTranslation()
  const selectionState = accessSelectionState()
  const transforming = useHookstate<boolean>(false)
  const transformHistory = useHookstate<string[]>([])
  const transformParms = useHookstate<ModelTransformParameters>({
    modelFormat: 'glb',
    useMeshopt: false,
    useMeshQuantization: true,
    useDraco: true,
    textureFormat: 'ktx2',
    maxTextureSize: 1024
  })

  const vertexBakeOptions = useHookstate({
    map: true,
    emissive: true,
    lightMap: true,
    matcapPath: ''
  })

  const doVertexBake = useCallback(
    (modelState: State<ComponentType<typeof ModelComponent>>) => async () => {
      const attribs = [
        ...(vertexBakeOptions.map.value ? [{ field: 'map', attribName: 'uv' }] : []),
        ...(vertexBakeOptions.emissive.value ? [{ field: 'emissiveMap', attribName: 'uv' }] : []),
        ...(vertexBakeOptions.lightMap.value ? [{ field: 'lightMap', attribName: 'uv2' }] : [])
      ] as { field: keyof MeshStandardMaterial; attribName: string }[]
      const src: MaterialSource = { type: SourceType.MODEL, path: modelState.src.value }
      await Promise.all(
        materialsFromSource(src)?.map((matComponent) =>
          bakeToVertices<MeshStandardMaterial>(
            matComponent.material as MeshStandardMaterial,
            attribs,
            modelState.scene.value,
            MeshBasicMaterial.prototypeId
          )
        ) ?? []
      ) /*
    if ([AssetClass.Image, AssetClass.Video].includes(AssetLoader.getAssetClass(vertexBakeOptions.matcapPath.value))) {
      batchSetMaterialProperty(src, 'matcap', await AssetLoader.loadAsync(vertexBakeOptions.matcapPath.value))
    }*/
    },
    [vertexBakeOptions]
  )

  const attribToDelete = useHookstate('uv uv2')

  const deleteAttribute = useCallback(
    (modelState: State<ComponentType<typeof ModelComponent>>) => () => {
      const toDeletes = attribToDelete.value.split(/\s+/)
      modelState.scene.value?.traverse((mesh: Mesh) => {
        if (!mesh?.isMesh) return
        const geometry = mesh.geometry
        if (!geometry?.isBufferGeometry) return
        toDeletes.map((toDelete) => {
          if (geometry.hasAttribute(toDelete)) {
            geometry.deleteAttribute(toDelete)
          }
        })
      })
    },
    [attribToDelete]
  )

  const onChangeTransformParm = useCallback(
    (k: keyof ModelTransformParameters) => {
      return (val) => {
        transformParms[k].set(val)
      }
    },
    [transformParms]
  )

  const onTransformModel = useCallback(
    (modelState: State<ComponentType<typeof ModelComponent>>) => async () => {
      transforming.set(true)
      const modelSrc = modelState.src.value
      const nuPath = await API.instance.client.service('model-transform').create({
        path: modelSrc,
        transformParameters: transformParms.value
      })
      transformHistory.set([modelSrc, ...transformHistory.value])
      const [_, directoryToRefresh, fileName] = /.*\/(projects\/.*)\/([\w\d\s\-_\.]*)$/.exec(nuPath)!
      await FileBrowserService.fetchFiles(directoryToRefresh)
      onChangeModel(nuPath)
      transforming.set(false)
    },
    [transformParms]
  )

  const onUndoTransform = useCallback(async () => {
    const prev = transformHistory[0]
    onChangeModel(prev)
    transformHistory.set(transformHistory.value.slice(1))
  }, [transforming])

  const onBakeSelected = useCallback(async () => {
    const selectedModelEntities: Entity[] = selectionState.selectedEntities
      .get()
      .filter((entity) => typeof entity !== 'string' && hasComponent(entity, ModelComponent))
      .map((entity: Entity) => entity)
    for (const entity of selectedModelEntities) {
      console.log('at entity ' + entity)
      const modelComponent = getComponentState(entity, ModelComponent)
      console.log('processing model from src ' + modelComponent.src.value)
      //bake lightmaps to vertices
      console.log('baking vertices...')
      await doVertexBake(modelComponent)()
      console.log('baked vertices')
      //delete uv and uv2 attributes
      console.log('deleting attributes...')
      await deleteAttribute(modelComponent)()
      console.log('deleted attributes')
      //set materials to be double-sided
      modelComponent.scene.value?.traverse((mesh: Mesh) => {
        if (!mesh?.isMesh) return
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
        materials.map((material) => (material.side = DoubleSide))
      })
      //save changes to model
      const bakedPath = modelComponent.src.value.replace(/\.glb$/, '-baked.glb')
      console.log('saving baked model to ' + bakedPath + '...')
      await exportGLTF(entity, bakedPath)
      console.log('saved baked model')
      //perform gltf transform
      console.log('transforming model at ' + bakedPath + '...')
      const transformedPath = await API.instance.client.service('model-transform').create({
        path: bakedPath,
        transformParameters: transformParms.value
      })
      console.log('transformed model into ' + transformedPath)
      onChangeModel(transformedPath)
    }
  }, [selectionState.selectedEntities])

  return (
    <CollapsibleBlock label="Model Transform Properties">
      <TransformContainer>
        <LightmapBakerProperties modelState={modelState} />
        <CollapsibleBlock label="glTF-Transform">
          <ElementsContainer>
            <InputGroup name="Model Format" label={t('editor:properties.model.transform.modelFormat')}>
              <SelectInput
                value={transformParms.modelFormat.value}
                onChange={onChangeTransformParm('modelFormat')}
                options={[
                  { label: 'glB', value: 'glb' },
                  { label: 'glTF', value: 'gltf' }
                ]}
              />
            </InputGroup>
            <InputGroup name="Use Meshopt" label={t('editor:properties.model.transform.useMeshopt')}>
              <BooleanInput value={transformParms.useMeshopt.value} onChange={onChangeTransformParm('useMeshopt')} />
            </InputGroup>
            <InputGroup name="Use Mesh Quantization" label={t('editor:properties.model.transform.useQuantization')}>
              <BooleanInput
                value={transformParms.useMeshQuantization.value}
                onChange={onChangeTransformParm('useMeshQuantization')}
              />
            </InputGroup>
            <InputGroup name="Use DRACO Compression" label={t('editor:properties.model.transform.useDraco')}>
              <BooleanInput value={transformParms.useDraco.value} onChange={onChangeTransformParm('useDraco')} />
            </InputGroup>
            <InputGroup name="Texture Format" label={t('editor:properties.model.transform.textureFormat')}>
              <SelectInput
                value={transformParms.textureFormat.value}
                onChange={onChangeTransformParm('textureFormat')}
                options={[
                  { label: 'Default', value: 'default' },
                  { label: 'JPG', value: 'jpg' },
                  { label: 'KTX2', value: 'ktx2' },
                  { label: 'PNG', value: 'png' },
                  { label: 'WebP', value: 'webp' }
                ]}
              />
            </InputGroup>
            <NumericInputGroup
              name="Max Texture Size"
              label={t('editor:properties.model.transform.maxTextureSize')}
              value={transformParms.maxTextureSize.value}
              onChange={onChangeTransformParm('maxTextureSize')}
              max={4096}
              min={64}
            />
            {!transforming.value && <OptimizeButton onClick={onTransformModel(modelState)}>Optimize</OptimizeButton>}
            {transforming.value && <p>Transforming...</p>}
            {transformHistory.length > 0 && <Button onClick={onUndoTransform}>Undo</Button>}
          </ElementsContainer>
        </CollapsibleBlock>
        <CollapsibleBlock label="Delete Attribute">
          <InputGroup name="Attribute" label="Attribute">
            <StringInput value={attribToDelete.value} onChange={attribToDelete.set} />
          </InputGroup>
          <Button onClick={deleteAttribute(modelState)}>Delete Attribute</Button>
        </CollapsibleBlock>
        <CollapsibleBlock label="Bake To Vertices">
          <InputGroup name="map" label="map">
            <BooleanInput
              value={vertexBakeOptions.map.value}
              onChange={(val: boolean) => {
                vertexBakeOptions.map.set(val)
              }}
            />
          </InputGroup>
          <InputGroup name="lightMap" label="lightMap">
            <BooleanInput
              value={vertexBakeOptions.lightMap.value}
              onChange={(val: boolean) => {
                vertexBakeOptions.lightMap.set(val)
              }}
            />
          </InputGroup>
          <InputGroup name="matcap" label="matcap">
            <TexturePreviewInput
              value={vertexBakeOptions.matcapPath.value}
              onChange={(val: string) => {
                vertexBakeOptions.matcapPath.set(val)
              }}
            />
          </InputGroup>
          <Button onClick={doVertexBake(modelState)}>Bake To Vertices</Button>
          <Button onClick={onBakeSelected}>Bake Selected</Button>
        </CollapsibleBlock>
      </TransformContainer>
    </CollapsibleBlock>
  )
}
