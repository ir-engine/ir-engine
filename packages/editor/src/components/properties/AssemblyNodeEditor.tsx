import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AssemblyComponent, LoadState } from '@xrengine/engine/src/scene/components/AssemblyComponent'
import { loadAsset, unloadAsset } from '@xrengine/engine/src/scene/functions/loaders/AssemblyComponentFunctions'
import { dispatchAction } from '@xrengine/hyperflux'

import { exportAssembly } from '../../functions/assetFunctions'
import { EditorAction } from '../../services/EditorServices'
import { SelectionAction } from '../../services/SelectionServices'
import AssemblyInput from '../inputs/AssemblyInput'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const AssemblyNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const node = props.node
  const asset = useComponent(entity, AssemblyComponent)
  const isLoaded = asset.loaded.value

  const onUnload = async () => {
    unloadAsset(entity)
    await new Promise((resolve) => setTimeout(resolve, 1))
    dispatchAction(EditorAction.sceneModified({ modified: true }))
    dispatchAction(SelectionAction.changedSceneGraph({}))
  }

  const onLoad = async () => {
    await loadAsset(entity)
    dispatchAction(EditorAction.sceneModified({ modified: true }))
    dispatchAction(SelectionAction.changedSceneGraph({}))
  }

  const onReload = async () => {
    await onUnload()
    await onLoad()
  }

  const onExportAsset = async () => {
    await exportAssembly(node)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties:asset.name')}
      description={t('editor:properties:asset.description')}
    >
      <InputGroup name="src" label={t('editor:properties.asset.lbl-assetPath')}>
        <AssemblyInput value={asset.src.value} onChange={updateProperty(AssemblyComponent, 'src')} />
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
        <InputGroup name={t('editor:properties:asset.lbl-exportOptions')}>
          <PropertiesPanelButton onClick={onExportAsset}>
            {t('editor:properties:asset.lbl-export')}
          </PropertiesPanelButton>
        </InputGroup>
      )}
    </NodeEditor>
  )
}
