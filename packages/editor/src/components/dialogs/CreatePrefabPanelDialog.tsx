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
import { staticResourcePath } from '@etherealengine/common/src/schema.type.module'
import { Engine, Entity, hasComponent, setComponent } from '@etherealengine/ecs'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { getState } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Input from '@etherealengine/ui/src/primitives/tailwind/Input'
import Modal from '@etherealengine/ui/src/primitives/tailwind/Modal'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { exportRelativeGLTF } from '../../functions/exportGLTF'
import { EditorState } from '../../services/EditorServices'
import { HeirarchyTreeNodeType } from '../hierarchy/HeirarchyTreeWalker'

export default function CreatePrefabPanel({ node }: { node?: HeirarchyTreeNodeType }) {
  const entity = node?.entity as Entity
  const [defaultPrefabFolder, setDefaultPrefabFolder] = useState<string>('/assets/custom-prefabs')
  const [prefabName, setPrefabName] = useState<string>('prefab')
  const [prefabTag, setPrefabTag] = useState<string[]>([])
  const { t } = useTranslation()

  const onExportPrefab = async () => {
    if (!hasComponent(entity, ModelComponent)) {
      EditorControlFunctions.addOrRemoveComponent([entity], ModelComponent, true)
      setComponent(entity, ModelComponent)
    }
    const editorState = getState(EditorState)
    const fileName = defaultPrefabFolder + '/' + prefabName + '.gltf'
    const srcProject = editorState.projectName!
    try {
      exportRelativeGLTF(entity, srcProject, fileName)
      //pass static resource
      const resources = await Engine.instance.api.service(staticResourcePath).find({
        query: { key: 'projects/' + srcProject + fileName }
      })
      if (resources.data.length === 0) {
        throw new Error('User not found')
      }
      const resource = resources.data[0]
      await Engine.instance.api.service(staticResourcePath).patch(resource.id, { tags: prefabTag })
      PopoverState.hidePopupover()
      setDefaultPrefabFolder('/assets/custom-prefabs')
      setPrefabName('prefab')
      setPrefabTag([])
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

      <Button
        size="small"
        variant="outline"
        className="text-left text-xs"
        onClick={() => {
          setPrefabTag([...(prefabTag ?? []), ''])
        }}
      >
        {t('editor:layout.filebrowser.fileProperties.addTag')}
      </Button>
      <div>
        {(prefabTag ?? []).map((tag, index) => (
          <div style={{ display: 'flex', flexDirection: 'row', margin: '0, 16px 0 0' }}>
            <Input
              key={index}
              label={t('editor:layout.filebrowser.fileProperties.tag')}
              onChange={(event) => (prefabTag[index] = event.target.value)}
              value={prefabTag.values[index]}
            />
            <Button
              onClick={() => {
                setPrefabTag(prefabTag.filter((_, i) => i !== index))
              }}
              size="small"
              variant="outline"
              className="text-left text-xs"
            >
              {' '}
              x{' '}
            </Button>
          </div>
        ))}
      </div>
    </Modal>
  )
}
