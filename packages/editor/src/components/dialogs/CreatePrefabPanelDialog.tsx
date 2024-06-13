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

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import { Entity, getMutableComponent, hasComponent } from '@etherealengine/ecs'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import Modal from '@etherealengine/ui/src/primitives/tailwind/Modal'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { HeirarchyTreeNodeType } from '../hierarchy/HeirarchyTreeWalker'
import { PrefabSettingsState } from '../prefabs/PrefabEditors'

export default function CreatePrefabPanel({ node }: { node?: HeirarchyTreeNodeType }) {
  const prefabSettingsState = useHookstate(getMutableState(PrefabSettingsState))
  const entity = node?.entity as Entity
  const [defaultPrefabFolder, setDefaultPrefabFolder] = useState<string>(prefabSettingsState.prefabFolder.value)
  const [prefabName, setPrefabName] = useState<string>(prefabSettingsState.prefabName.value)
  const [prefabTag, setPrefabTag] = useState<string>(prefabSettingsState.prefabTag.value)
  const { t } = useTranslation()

  const onExportPrefab = async () => {
    const defaultPrefabPath = prefabSettingsState.prefabFolder.value
    const defaulPrefabName = prefabSettingsState.prefabName.value
    prefabSettingsState.prefabFolder.set(defaultPrefabFolder)
    prefabSettingsState.prefabName.set(prefabName)
    prefabSettingsState.entity.set(entity)
    if (!hasComponent(entity, ModelComponent)) {
      EditorControlFunctions.addOrRemoveComponent([entity], ModelComponent, true)
      //EditorControlFunctions.addOrRemoveComponent([entity], SourceComponent, true)
    }
    const modelComponent = getMutableComponent(entity, ModelComponent)
    try {
      await modelComponent.save.set(true)
      PopoverState.hidePopupover()
    } catch (e) {
      console.error(e)
    }
  }
  return (
    <Modal
      title="Create Prefab"
      onSubmit={onExportPrefab}
      className="w-[50vw] max-w-2xl"
      onClose={PopoverState.hidePopupover}
    >
      <Input
        value={defaultPrefabFolder}
        onChange={(event) => setDefaultPrefabFolder(event.target.value)}
        label="Default Save Folder"
      />
      <Input value={prefabName} onChange={(event) => setPrefabName(event.target.value)} label="Name" />

      <Input value={prefabTag} onChange={(event) => setPrefabTag(event.target.value)} label="Tag" />
      <Button size="small" variant="outline" className="text-left text-xs">
        {t('editor:layout.filebrowser.fileProperties.addTag')}
      </Button>
    </Modal>
  )
}
