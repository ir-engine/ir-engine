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
import { twMerge } from 'tailwind-merge'

import { IoMdClose } from 'react-icons/io'
import Button from '../Button'
import LoadingView from '../LoadingView'
import Text from '../Text'

export interface ModalProps {
  title?: string
  hideFooter?: boolean
  className?: string
  children: ReactNode
  submitLoading?: boolean
  showCloseButton?: boolean
  closeButtonDisabled?: boolean
  submitButtonDisabled?: boolean
  closeButtonText?: string
  submitButtonText?: string
  startSubmitIcon?: ReactNode
  actionsOnHeader?: boolean
  onClose?: (isHeader: boolean) => void
  onSubmit?: () => void
}

export const ModalHeader = ({
  title,
  actionsOnHeader,
  startSubmitIcon,
  submitButtonText,
  onSubmit,
  onClose
}: {
  closeIcon?: boolean
  title?: string
  startSubmitIcon?: ReactNode
  actionsOnHeader?: boolean
  submitButtonText?: string
  onSubmit?: () => void
  onClose?: (isHeader: boolean) => void
}) => {
  // sticky top-0 z-10 bg-theme-surface-main
  const { t } = useTranslation()
  return (
    <div className="relative flex items-center justify-between border-b border-b-theme-primary px-6 py-5">
      {title && <Text>{title}</Text>}
      {onSubmit && actionsOnHeader && (
        <Button startIcon={startSubmitIcon} onClick={onSubmit} variant="primary" className="mr-6 place-self-end">
          {submitButtonText || t('common:components.confirm')}
        </Button>
      )}
      <Button
        className="absolute right-0 border-0 dark:bg-transparent dark:text-white"
        startIcon={<IoMdClose />}
        onClick={() => onClose && onClose(true)}
      />
    </div>
  )
}

export const ModalFooter = ({
  onCancel,
  onSubmit,
  submitLoading,
  closeButtonDisabled,
  submitButtonDisabled,
  closeButtonText,
  submitButtonText,
  startSubmitIcon,
  showCloseButton = true
}: {
  onCancel?: (isHeader: boolean) => void
  onSubmit?: () => void
  submitLoading?: boolean
  closeButtonDisabled?: boolean
  submitButtonDisabled?: boolean
  closeButtonText?: string
  submitButtonText?: string
  showCloseButton?: boolean
  startSubmitIcon?: ReactNode
}) => {
  const { t } = useTranslation()
  return (
    <div className="grid grid-flow-col border-t border-t-theme-primary px-6 py-5">
      {showCloseButton && (
        <Button variant="secondary" disabled={closeButtonDisabled} onClick={() => onCancel && onCancel(false)}>
          {closeButtonText || t('common:components.cancel')}
        </Button>
      )}
      {onSubmit && (
        <Button
          startIcon={startSubmitIcon}
          endIcon={submitLoading ? <LoadingView spinnerOnly className="h-6 w-6" /> : undefined}
          disabled={submitButtonDisabled || submitLoading}
          onClick={onSubmit}
          variant="primary"
          className="place-self-end"
        >
          {submitButtonText || t('common:components.confirm')}
        </Button>
      )}
    </div>
  )
}

const Modal = ({
  title,
  onClose,
  onSubmit,
  hideFooter,
  children,
  className,
  submitLoading,
  closeButtonText,
  submitButtonText,
  closeButtonDisabled,
  submitButtonDisabled,
  startSubmitIcon,
  actionsOnHeader = false,
  showCloseButton = true
}: ModalProps) => {
  const twClassName = twMerge('relative z-50 max-h-[80vh] w-full', className)
  return (
    <div className={twClassName}>
      <div className="relative rounded-lg bg-theme-surface-modal shadow">
        {onClose && (
          <ModalHeader
            actionsOnHeader={actionsOnHeader}
            startSubmitIcon={startSubmitIcon}
            submitButtonText={submitButtonText}
            onSubmit={onSubmit}
            title={title}
            onClose={onClose}
          />
        )}
        <div className="h-fit max-h-[60vh] w-full overflow-y-auto px-10 py-6">{children}</div>
        {!hideFooter && !actionsOnHeader && (
          <ModalFooter
            closeButtonText={closeButtonText}
            submitButtonText={submitButtonText}
            closeButtonDisabled={closeButtonDisabled}
            submitButtonDisabled={submitButtonDisabled}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLoading={submitLoading}
            showCloseButton={showCloseButton}
            startSubmitIcon={startSubmitIcon}
          />
        )}
      </div>
    </div>
  )
}

export default Modal
