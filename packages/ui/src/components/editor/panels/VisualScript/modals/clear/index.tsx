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

import React from 'react'
import { useTranslation } from 'react-i18next'
import { useReactFlow } from 'reactflow'
import { Modal } from '..'

export type ClearModalProps = {
  open?: boolean
  onClose: () => void
}

export const ClearModal: React.FC<ClearModalProps> = ({ open = false, onClose }) => {
  const instance = useReactFlow()
  const { t } = useTranslation()

  const handleClear = () => {
    instance.setNodes([])
    instance.setEdges([])
    // TODO better way to call fit vew after edges render
    setTimeout(() => {
      instance.fitView()
    }, 100)
    onClose()
  }

  return (
    <Modal
      title={t('editor:visualScript.modal.clear.title')}
      actions={[
        { label: t('editor:visualScript.modal.buttons.cancel'), onClick: onClose },
        { label: t('editor:visualScript.modal.buttons.clear'), onClick: handleClear }
      ]}
      open={open}
      onClose={onClose}
    >
      <p>{t('editor:visualScript.modal.clear.confirm')}</p>
    </Modal>
  )
}
