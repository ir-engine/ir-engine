import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Mesh, MeshStandardMaterial } from 'three'

import { API } from '@xrengine/client-core/src/API'
import { FileBrowserService } from '@xrengine/client-core/src/common/services/FileBrowserService'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { ModelTransformParameters } from '@xrengine/engine/src/assets/classes/ModelTransformLoader'
import { AssetClass } from '@xrengine/engine/src/assets/enum/AssetClass'
import { MaterialSource, SourceType } from '@xrengine/engine/src/renderer/materials/components/MaterialSource'
import MeshBasicMaterial from '@xrengine/engine/src/renderer/materials/constants/material-prototypes/MeshBasicMaterial.mat'
import bakeToVertices from '@xrengine/engine/src/renderer/materials/functions/bakeToVertices'
import { batchSetMaterialProperty } from '@xrengine/engine/src/renderer/materials/functions/batchEditMaterials'
import { materialsFromSource } from '@xrengine/engine/src/renderer/materials/functions/Utilities'
import { useHookstate } from '@xrengine/hyperflux'

import { ToggleButton } from '@mui/material'

import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import StringInput from '../inputs/StringInput'
import TexturePreviewInput from '../inputs/TexturePreviewInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'

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

export default function ModelTransformProperties({ modelComponent, onChangeModel }) {
  const { t } = useTranslation()

  const [transforming, setTransforming] = useState<boolean>(false)
  const [transformHistory, setTransformHistory] = useState<string[]>(() => [])
  const [transformParms, setTransformParms] = useState<ModelTransformParameters>({
    modelFormat: 'gltf',
    useMeshopt: true,
    useMeshQuantization: false,
    useDraco: true,
    textureFormat: 'ktx2',
    maxTextureSize: 1024
  })

  const vertexBakeOptions = useHookstate({
    map: true,
    lightMap: true,
    matcapPath: ''
  })

  const doVertexBake = useCallback(async () => {
    const attribs = [
      ...(vertexBakeOptions.map.value ? [{ field: 'map', attribName: 'uv' }] : []),
      ...(vertexBakeOptions.lightMap.value ? [{ field: 'lightMap', attribName: 'uv2' }] : [])
    ] as { field: keyof MeshStandardMaterial; attribName: string }[]
    const src: MaterialSource = { type: SourceType.MODEL, path: modelComponent.src }
    await Promise.all(
      materialsFromSource(src)?.map((matComponent) =>
        bakeToVertices<MeshStandardMaterial>(
          matComponent.material as MeshStandardMaterial,
          attribs,
          modelComponent.scene,
          MeshBasicMaterial.prototypeId
        )
      ) ?? []
    ) /*
    if ([AssetClass.Image, AssetClass.Video].includes(AssetLoader.getAssetClass(vertexBakeOptions.matcapPath.value))) {
      batchSetMaterialProperty(src, 'matcap', await AssetLoader.loadAsync(vertexBakeOptions.matcapPath.value))
    }*/
  }, [])

  const attribToDelete = useHookstate('')

  const deleteAttribute = useCallback(() => {
    const toDelete = attribToDelete.value
    modelComponent.scene?.traverse((mesh: Mesh) => {
      if (!mesh?.isMesh) return
      const geometry = mesh.geometry
      if (!geometry?.isBufferGeometry) return
      if (geometry.hasAttribute(toDelete)) {
        geometry.deleteAttribute(toDelete)
      }
    })
  }, [attribToDelete])

  function onChangeTransformParm(k) {
    return (val) => {
      let nuParms = { ...transformParms }
      nuParms[k] = val
      setTransformParms(nuParms)
    }
  }

  async function onTransformModel() {
    setTransforming(true)
    const nuPath = await API.instance.client.service('model-transform').create({
      path: modelComponent.src,
      transformParameters: { ...transformParms }
    })
    setTransformHistory([modelComponent.src, ...transformHistory])
    const [_, directoryToRefresh, fileName] = /.*\/(projects\/.*)\/([\w\d\s\-_\.]*)$/.exec(nuPath)!
    await FileBrowserService.fetchFiles(directoryToRefresh)
    onChangeModel(nuPath)
    setTransforming(false)
  }

  async function onUndoTransform() {
    const prev = transformHistory[0]
    onChangeModel(prev)
    setTransformHistory([...transformHistory].slice(1))
  }

  return (
    <CollapsibleBlock label="Model Transform Properties">
      <TransformContainer>
        <CollapsibleBlock label="glTF-Transform">
          <ElementsContainer>
            <InputGroup name="Model Format" label={t('editor:properties.model.transform.modelFormat')}>
              <SelectInput
                value={transformParms.modelFormat}
                onChange={onChangeTransformParm('modelFormat')}
                options={[
                  { label: 'glB', value: 'glb' },
                  { label: 'glTF', value: 'gltf' }
                ]}
              />
            </InputGroup>
            <InputGroup name="Use Meshopt" label={t('editor:properties.model.transform.useMeshopt')}>
              <BooleanInput value={transformParms.useMeshopt} onChange={onChangeTransformParm('useMeshopt')} />
            </InputGroup>
            <InputGroup name="Use Mesh Quantization" label={t('editor:properties.model.transform.useQuantization')}>
              <BooleanInput
                value={transformParms.useMeshQuantization}
                onChange={onChangeTransformParm('useMeshQuantization')}
              />
            </InputGroup>
            <InputGroup name="Use DRACO Compression" label={t('editor:properties.model.transform.useDraco')}>
              <BooleanInput value={transformParms.useDraco} onChange={onChangeTransformParm('useDraco')} />
            </InputGroup>
            <InputGroup name="Texture Format" label={t('editor:properties.model.transform.textureFormat')}>
              <SelectInput
                value={transformParms.textureFormat}
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
              value={transformParms.maxTextureSize}
              onChange={onChangeTransformParm('maxTextureSize')}
              max={4096}
              min={64}
            />
            {!transforming && <OptimizeButton onClick={onTransformModel}>Optimize</OptimizeButton>}
            {transforming && <p>Transforming...</p>}
            {transformHistory.length > 0 && <Button onClick={onUndoTransform}>Undo</Button>}
          </ElementsContainer>
        </CollapsibleBlock>
        <CollapsibleBlock label="Delete Attribute">
          <InputGroup name="Attribute" label="Attribute">
            <StringInput value={attribToDelete.value} onChange={attribToDelete.set} />
          </InputGroup>
          <Button onClick={deleteAttribute}>Delete Attribute</Button>
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
          <Button onClick={doVertexBake}>Bake To Vertices</Button>
        </CollapsibleBlock>
      </TransformContainer>
    </CollapsibleBlock>
  )
}
