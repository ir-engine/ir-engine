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

import React, { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MdClose } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import Button from '../Button'
import Text from '../Text'

export interface ModalProps {
  title?: string
  hideFooter?: boolean
  className?: string
  children: ReactNode
  onClose?: () => void
  onSubmit?: () => void
}

export const ModalHeader = ({ title, onClose }: { closeIcon?: boolean; title?: string; onClose?: () => void }) => {
  return (
    <div className="relative flex justify-center items-center p-5 border-b border-b-gray-200">
      {title && <Text>{title}</Text>}
      <Button variant="outline" className="border-0 absolute right-0" startIcon={<MdClose />} onClick={onClose} />
    </div>
  )
}

export const ModalFooter = ({ onCancel, onSubmit }: { onCancel?: () => void; onSubmit?: () => void }) => {
  const { t } = useTranslation()
  return (
    <div className=" grid grid-flow-col border-t border-t-gray-200 py-5 px-6">
      <Button variant="outline" onClick={onCancel}>
        {t('common:components.cancel')}
      </Button>
      {onSubmit && (
        <Button onClick={onSubmit} className="place-self-end">
          {t('common:components.confirm')}
        </Button>
      )}
    </div>
  )
}

const Modal = ({ title, onClose, onSubmit, hideFooter, children, className }: ModalProps) => {
  const twClassName = twMerge('relative p-4 w-full max-w-2xl max-h-full', className)
  return (
    <div className={twClassName}>
      <div className="relative bg-theme-primary rounded-lg shadow">
        <ModalHeader title={title} onClose={onClose} />
        <div className="py-5 px-10">{children}</div>
        {!hideFooter && <ModalFooter onCancel={onClose} onSubmit={onSubmit} />}
      </div>
    </div>
  )
}

export default Modal
