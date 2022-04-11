import React from 'react'
import { useTranslation } from 'react-i18next'

import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  AssetComponent,
  AssetComponentType,
  AssetLoadedComponent
} from '@xrengine/engine/src/scene/components/AssetComponent'
import { loadAsset, unloadAsset } from '@xrengine/engine/src/scene/functions/loaders/AssetComponentFunctions'

import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const AssetNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.node.entity
  const asset = getComponent(entity, AssetComponent)
  const onUnload = () => unloadAsset(entity)
  const onLoad = async () => await loadAsset(entity)
  return (
    <NodeEditor
      {...props}
      name={t('editor:properties:asset.name')}
      description={t('editor:properties:asset.description')}
    >
      <InputGroup name="Asset ID" label={t('editor:properties.asset.lbl-assetId')}>
        <StringInput value={asset.path} onChange={updateProperty(AssetComponent, 'path')} />
      </InputGroup>
      {!asset.loaded && (
        <PropertiesPanelButton onClick={onLoad}>{t('editor:properties:asset.lbl-load')}</PropertiesPanelButton>
      )}
      {asset.loaded && (
        <PropertiesPanelButton onClick={onUnload}>{t('editor:properties:asset.lbl-unload')}</PropertiesPanelButton>
      )}
    </NodeEditor>
  )
}
