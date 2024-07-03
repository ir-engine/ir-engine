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
import { t } from 'i18next'
import React from 'react'
import ErrorView from '../../../primitives/tailwind/ErrorView'
import Modal, { ModalProps } from '../../../primitives/tailwind/Modal'

interface ErrorDialogProps {
  title: string
  description?: string
  modalProps?: ModalProps
}

const ErrorDialog = ({ title, description, modalProps }: ErrorDialogProps) => {
  return (
    <Modal
      title={t('admin:components.common.confirmation')}
      onClose={PopoverState.hidePopupover}
      showCloseButton={false}
      onSubmit={() => PopoverState.hidePopupover()}
      className="w-[50vw] max-w-2xl"
      {...modalProps}
    >
      <ErrorView title={title} description={description} />
    </Modal>
  )
}

export default ErrorDialog
