import { Property, PropertyType } from '@gltf-transform/core'
import React, { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { API } from '@xrengine/client-core/src/API'
import { FileBrowserService } from '@xrengine/client-core/src/common/services/FileBrowserService'
import { EditorAction, useEditorState } from '@xrengine/editor/src/services/EditorServices'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import ModelTransformLoader, {
  ModelTransformParameters
} from '@xrengine/engine/src/assets/classes/ModelTransformLoader'
import { ModelComponentType } from '@xrengine/engine/src/scene/components/ModelComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import NodeIcon from '@mui/icons-material/AccountTree'
import ImageIcon from '@mui/icons-material/Image'
import MaterialIcon from '@mui/icons-material/Texture'
import MeshIcon from '@mui/icons-material/ViewInAr'
import { Box, ButtonGroup, Grid, List, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'

import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import SelectInput from '../inputs/SelectInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import ModelResourceProperties from './ModelResourceProperties'

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
    useMeshopt: true,
    useMeshQuantization: false,
    textureFormat: 'ktx2',
    maxTextureSize: 1024
  })

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
  const [internalFilter, setInternalFilter] = useState<string[]>(() => [])

  const transformer = ModelTransformLoader()
  async function onUndoTransform() {
    const prev = transformHistory[0]
    onChangeModel(prev)
    setTransformHistory([...transformHistory].slice(1))
  }

  async function getModelResources(filter) {
    const document = await transformer.load(modelComponent.src, true)
    const root = document.getRoot()
    const listTable = (element) => {
      switch (element) {
        case 'meshes':
          return root.listMeshes()
        case 'textures':
          return root.listTextures()
        case 'materials':
          return root.listMaterials()
        case 'nodes':
          return root.listNodes()
        default:
          return []
      }
    }
    const entries = listTable(filter).map((resource, idx): [string, Property] => [
      `${resource.propertyType}-${idx}`,
      resource
    ])
    return new Map(entries)
  }
  const [resources, setResources] = useState<Map<any, any>>(() => new Map())

  const [selected, setSelected] = useState<string>(() => '')

  const selectedResource: Property = resources.has(selected) ? resources.get(selected)! : null

  async function onChangeFilter(event, nuFilter) {
    setInternalFilter(nuFilter)
    setResources(await getModelResources(nuFilter))
  }

  function onChangeSelected(key) {
    return () => setSelected(key)
  }

  return (
    <CollapsibleBlock label="Model Transform Properties">
      <TransformContainer>
        <ElementsContainer>
          <Typography variant="h6" sx={{ textAlign: 'center', paddingTop: '16px', paddingBottom: '12px' }}></Typography>
          <ToggleButtonGroup value={internalFilter} onChange={onChangeFilter} exclusive>
            <FilterToggle value="meshes" aria-label="meshes" color="primary">
              Mesh
            </FilterToggle>
            <FilterToggle value="textures" aria-label="textures" color="primary">
              Texture
            </FilterToggle>
            <FilterToggle value="materials" aria-label="materials" color="primary">
              Material
            </FilterToggle>
            <FilterToggle value="nodes" aria-label="nodes" color="primary">
              Node
            </FilterToggle>
          </ToggleButtonGroup>
          <List sx={{ maxHeight: '128px', overflowX: 'clip', overflowY: 'scroll' }}>
            {[...resources.entries()].map(([key, resource]: [string, Property], index) => {
              const resourceIcons = {
                Mesh: () => <MeshIcon />,
                Texture: () => <ImageIcon />,
                Material: () => <MaterialIcon />,
                Node: () => <NodeIcon />
              }
              return (
                <ListItem key={key}>
                  <ListItemButton selected={selected === key} onClick={onChangeSelected(key)}>
                    {resourceIcons[resource.propertyType]()}
                    <ListItemText id={`model-resource-name-${key}`} primary={resource.getName()} />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
          <ElementsContainer>
            {!!selectedResource && <ModelResourceProperties prop={selectedResource} />}
          </ElementsContainer>
        </ElementsContainer>
        <ElementsContainer>
          <InputGroup name="Use Meshopt" label={t('editor:properties.model.transform.useMeshopt')}>
            <BooleanInput value={transformParms.useMeshopt} onChange={onChangeTransformParm('useMeshopt')} />
          </InputGroup>
          <InputGroup name="Use Mesh Quantization" label={t('editor:properties.model.transform.useQuantization')}>
            <BooleanInput
              value={transformParms.useMeshQuantization}
              onChange={onChangeTransformParm('useMeshQuantization')}
            />
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
      </TransformContainer>
    </CollapsibleBlock>
  )
}
