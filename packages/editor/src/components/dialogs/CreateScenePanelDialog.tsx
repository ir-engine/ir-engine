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
import { NO_PROXY, useMutableState } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Modal from '@etherealengine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { onNewScene } from '../../functions/sceneFunctions'
import { EditorState } from '../../services/EditorServices'

export default function CreateSceneDialog() {
  const element = useMutableState(EditorState).uiAddons.newScene.get(NO_PROXY)
  const { t } = useTranslation()
  return (
    <Modal
      title={t('editor:dialog.createScene.title')}
      className="w-[15vw] max-w-2xl"
      onClose={PopoverState.hidePopupover}
    >
      <div className="flex justify-center">
        <Button
          size="small"
          variant="outline"
          className="w-[10vw]"
          onClick={() => {
            onNewScene()
            PopoverState.hidePopupover()
          }}
        >
          {t('editor:dialog.createScene.create')}
        </Button>
      </div>
      <div className="flex justify-center">{Object.values(element).map((value) => value)}</div>
    </Modal>
  )
}
