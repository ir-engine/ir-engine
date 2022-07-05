import React, { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { API } from '@xrengine/client-core/src/API'
import { FileBrowserService } from '@xrengine/client-core/src/common/services/FileBrowserService'
import { EditorAction, useEditorState } from '@xrengine/editor/src/services/EditorServices'
import { AssetLoader } from '@xrengine/engine/src/assets/classes/AssetLoader'
import { ModelComponentType } from '@xrengine/engine/src/scene/components/ModelComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { ButtonGroup, Grid, List, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import Divider from '@mui/material/Divider'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'

import { Button } from '../inputs/Button'

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
  const [transforming, setTransforming] = useState<boolean>(false)
  async function onTransformModel() {
    setTransforming(true)
    const nuPath = await API.instance.client.service('model-transform').create({ path: modelComponent.src })
    const [_, directoryToRefresh, fileName] = /.*\/(projects\/.*)\/([\w\d\s\-_\.]*)$/.exec(nuPath)!
    await FileBrowserService.fetchFiles(directoryToRefresh)
    await AssetLoader.loadAsync(nuPath)
    onChangeModel(nuPath)
    setTransforming(false)
  }

  const [internalFilter, setInternalFilter] = useState<string[]>(() => [])
  async function onChangeFilter(event, nuFilter) {
    setInternalFilter(nuFilter)
  }

  return (
    <TransformContainer>
      <ElementsContainer>
        <Typography variant="h6" sx={{ textAlign: 'center', paddingTop: '16px', paddingBottom: '12px' }}></Typography>
        <ToggleButtonGroup value={internalFilter} onChange={onChangeFilter}>
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
        <List></List>
      </ElementsContainer>
      {!transforming && <OptimizeButton onClick={onTransformModel}>Optimize</OptimizeButton>}
      {transforming && <p>Transforming...</p>}
    </TransformContainer>
  )
}
