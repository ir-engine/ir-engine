import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { store } from '@xrengine/client-core/src/store'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { createEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import {
  AssetComponent,
  AssetComponentType,
  AssetLoadedComponent,
  LoadState
} from '@xrengine/engine/src/scene/components/AssetComponent'
import { Object3DComponent, Object3DWithEntity } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { sceneToGLTF } from '@xrengine/engine/src/scene/functions/GLTFConversion'
import {
  exportAsset,
  loadAsset,
  unloadAsset
} from '@xrengine/engine/src/scene/functions/loaders/AssetComponentFunctions'
import { ScenePrefabs } from '@xrengine/engine/src/scene/functions/registerPrefabs'

import { executeCommand } from '../../classes/History'
import EditorCommands from '../../constants/EditorCommands'
import { accessEditorState, EditorAction } from '../../services/EditorServices'
import { SelectionAction } from '../../services/SelectionServices'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const AssetNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const node = props.node
  const asset = getComponent(entity, AssetComponent)

  const [isLoaded, setIsLoaded] = useState(asset.loaded)

  const onUnload = async () => {
    unloadAsset(entity)
    setIsLoaded(LoadState.UNLOADED)
    await new Promise((resolve) => setTimeout(resolve, 1))
  }

  const onLoad = async () => {
    setIsLoaded(LoadState.LOADING)
    await loadAsset(entity)
    setIsLoaded(LoadState.LOADED)
  }

  const onReload = async () => {
    await onUnload()
    await onLoad()
  }

  const onExportAsset = async () => {
    await exportAsset(node)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties:asset.name')}
      description={t('editor:properties:asset.description')}
    >
      <InputGroup name="Asset Path" label={t('editor:properties.asset.lbl-assetPath')}>
        <StringInput value={asset.path} onChange={updateProperty(AssetComponent, 'path')} />
      </InputGroup>
      {isLoaded === LoadState.UNLOADED && (
        <PropertiesPanelButton onClick={onLoad}>{t('editor:properties:asset.lbl-load')}</PropertiesPanelButton>
      )}
      {isLoaded === LoadState.LOADING && <p>{t('Loading...')}</p>}
      {isLoaded === LoadState.LOADED && (
        <InputGroup name={t('editor:properties:asset.lbl-options')}>
          <PropertiesPanelButton onClick={onUnload}>{t('editor:properties:asset.lbl-unload')}</PropertiesPanelButton>
          <PropertiesPanelButton onClick={onReload}>{t('editor:properties:asset.lbl-reload')}</PropertiesPanelButton>
        </InputGroup>
      )}
      {isLoaded !== LoadState.LOADING && (
        <InputGroup name="Asset Name" label={t('editor:properties:asset.lbl-assetName')}>
          <StringInput value={asset.name} onChange={updateProperty(AssetComponent, 'name')} />
        </InputGroup>
      )}
      {isLoaded !== LoadState.LOADING && (
        <InputGroup name={t('editor:properties:asset.lbl-exportOptions')}>
          <PropertiesPanelButton onClick={onExportAsset}>
            {t('editor:properties:asset.lbl-export')}
          </PropertiesPanelButton>
        </InputGroup>
      )}
    </NodeEditor>
  )
}
