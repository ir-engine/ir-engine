import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AssetComponent, LoadState } from '@xrengine/engine/src/scene/components/AssetComponent'
import { loadAsset, unloadAsset } from '@xrengine/engine/src/scene/functions/loaders/AssetComponentFunctions'
import { dispatchAction } from '@xrengine/hyperflux'

import { exportAsset } from '../../functions/assetFunctions'
import { EditorAction } from '../../services/EditorServices'
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
    dispatchAction(EditorAction.sceneModified({ modified: true }))
    dispatchAction(SelectionAction.changedSceneGraph({}))
  }

  const onLoad = async () => {
    setIsLoaded(LoadState.LOADING)
    await loadAsset(entity)
    setIsLoaded(LoadState.LOADED)
    dispatchAction(EditorAction.sceneModified({ modified: true }))
    dispatchAction(SelectionAction.changedSceneGraph({}))
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
