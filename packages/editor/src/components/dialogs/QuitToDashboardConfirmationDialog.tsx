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
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { onSaveScene } from '../../functions/sceneFunctions'

export default function QuitToDashboardConfirmationDialog({ resolve }: { resolve: (value: unknown) => void }) {
  const { t } = useTranslation()

  const onClose = (quit: boolean) => {
    resolve(quit)
    PopoverState.hidePopupover()
  }
  return (
    <Modal
      title={t('editor:dialog.saveScene.unsavedChanges.title')}
      className="w-[50vw] max-w-xl"
      hideFooter={true}
      onClose={() => {
        resolve(false)
        PopoverState.hidePopupover()
      }}
      rawChildren={
        <>
          <div className="py-6 text-center">
            <span>{t('editor:dialog.saveScene.info-question')}</span>
            <p className="text-xs text-red-600">{t('editor:dialog.saveScene.info-warning')}</p>
          </div>
          <div className="grid grid-flow-col border-t border-t-theme-primary px-5 py-6">
            <Button variant="transparent" className="border border-theme-primary" onClick={() => onClose(true)}>
              {t('editor:dialog.saveScene.discard-quit')}
            </Button>
            <div className="flex flex-1 place-content-end gap-2">
              <Button variant="secondary" onClick={() => onClose(false)}>
                {t('common:components.cancel')}
              </Button>
              <Button
                onClick={async () => {
                  await onSaveScene()
                  resolve(true)
                }}
              >
                {t('editor:dialog.saveScene.lbl-save-quit')}
              </Button>
            </div>
          </div>
        </>
      }
    />
  )
}
