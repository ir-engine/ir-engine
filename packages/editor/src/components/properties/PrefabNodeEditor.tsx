/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { LoadState, PrefabComponent } from '@etherealengine/engine/src/scene/components/PrefabComponent'
import { loadPrefab, unloadPrefab } from '@etherealengine/engine/src/scene/functions/loaders/PrefabComponentFunctions'
import { dispatchAction } from '@etherealengine/hyperflux'

import { exportPrefab } from '../../functions/assetFunctions'
import { SelectionAction } from '../../services/SelectionServices'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import PrefabInput from '../inputs/PrefabInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

export const PrefabNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const prefab = useComponent(entity, PrefabComponent)
  const isLoaded = prefab.loaded.value

  const onUnload = async () => {
    unloadPrefab(entity)
    await new Promise((resolve) => setTimeout(resolve, 1))
    dispatchAction(SelectionAction.changedSceneGraph({}))
  }

  const onLoad = async () => {
    await loadPrefab(entity)
    dispatchAction(SelectionAction.changedSceneGraph({}))
  }

  const onReload = async () => {
    await onUnload()
    await onLoad()
  }

  const onExportAsset = async () => {
    await exportPrefab(entity)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties:prefab.name')}
      description={t('editor:properties:prefab.description')}
    >
      <InputGroup name="src" label={t('editor:properties.prefab.lbl-prefabPath')}>
        <PrefabInput value={prefab.src.value} onChange={updateProperty(PrefabComponent, 'src')} />
      </InputGroup>
      {isLoaded === LoadState.UNLOADED && (
        <PropertiesPanelButton onClick={onLoad}>{t('editor:properties:prefab.lbl-load')}</PropertiesPanelButton>
      )}
      {isLoaded === LoadState.LOADING && <p>{t('Loading...')}</p>}
      {isLoaded === LoadState.LOADED && (
        <InputGroup name={t('editor:properties:prefab.lbl-options')}>
          <PropertiesPanelButton onClick={onUnload}>{t('editor:properties:prefab.lbl-unload')}</PropertiesPanelButton>
          <PropertiesPanelButton onClick={onReload}>{t('editor:properties:prefab.lbl-reload')}</PropertiesPanelButton>
        </InputGroup>
      )}
      {isLoaded !== LoadState.LOADING && (
        <InputGroup name={t('editor:properties:prefab.lbl-exportOptions')}>
          <PropertiesPanelButton onClick={onExportAsset}>
            {t('editor:properties:prefab.lbl-export')}
          </PropertiesPanelButton>
        </InputGroup>
      )}
    </NodeEditor>
  )
}
