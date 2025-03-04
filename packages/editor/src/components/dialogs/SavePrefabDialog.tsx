/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { cleanFileNameString } from '@ir-engine/common/src/utils/cleanFileName.ts'
import { getComponent, hasComponent } from '@ir-engine/ecs'
import { STATIC_ASSET_REGEX } from '@ir-engine/engine/src/assets/functions/pathResolver'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getState, useHookstate } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { exportRelativeGLTF } from '../../functions/exportGLTF'
import { EditorState } from '../../services/EditorServices'

export default function SavePrefabPanel({ entity }) {
  const { t } = useTranslation()
  if (!hasComponent(entity, GLTFComponent))
    throw new Error('Cannot save a prefab that has no GLTF Component on root entity')
  const gltfComponent = getComponent(entity, GLTFComponent)
  const srcPath = useHookstate(STATIC_ASSET_REGEX.exec(gltfComponent.src)?.[3].replace(/\.[^.]*$/, ''))
  const pathIssues = cleanFileNameString(srcPath.value ?? '') !== srcPath.value

  const onSavePrefab = async () => {
    const isGLTF = gltfComponent.src.endsWith('gltf')
    const saveName = srcPath.value + '.gltf'
    await exportRelativeGLTF(entity, getState(EditorState).projectName!, saveName, false)
    PopoverState.hidePopupover()
  }

  return (
    <Modal
      title={t('editor:dialog.savePrefab.title')}
      onSubmit={onSavePrefab}
      submitButtonDisabled={pathIssues}
      className="w-[50vw] max-w-2xl"
      onClose={PopoverState.hidePopupover}
    >
      <Input
        value={srcPath.value}
        onChange={(event) => {
          srcPath.set(event.target.value)
        }}
        labelProps={{
          text: t('editor:dialog.savePrefab.lbl-save-path'),
          position: 'top'
        }}
      />
      {pathIssues && <Text className="ml-5 text-red-400">{t('editor:dialog.savePrefab.warn-save-path')}</Text>}
    </Modal>
  )
}
