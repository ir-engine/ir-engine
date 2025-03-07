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

import React, { ReactNode } from 'react'

import { useTranslation } from 'react-i18next'
import { MdClose } from 'react-icons/md'
import { twMerge } from 'tailwind-merge'
import Button from '../Button'
import LoadingView from '../LoadingView'
import Text from '../Text'

export interface ModalProps {
  id?: string
  title?: string
  hideFooter?: boolean
  className?: string
  rawChildren?: ReactNode
  children?: ReactNode
  submitLoading?: boolean
  showCloseButton?: boolean
  closeButtonDisabled?: boolean
  submitButtonDisabled?: boolean
  closeButtonText?: string
  submitButtonText?: string
  onClose?: (isHeader: boolean) => void
  onSubmit?: () => void
}

export const ModalHeader = ({
  title,
  onClose
}: {
  closeIcon?: boolean
  title?: string
  onClose?: (isHeader: boolean) => void
}) => {
  // sticky top-0 z-10 bg-theme-surface-main
  return (
    <div className="relative flex items-center justify-center border-b border-b-theme-primary px-6 py-5">
      {title && <Text data-testid="modal-title-text">{title}</Text>}
      <Button
        variant="tertiary"
        className="absolute right-0 border-0 dark:bg-transparent dark:text-[#A3A3A3]"
        data-testid="modal-close-button"
        onClick={() => onClose && onClose(true)}
      >
        <MdClose />
      </Button>
    </div>
  )
}

export const ModalFooter = ({
  id,
  onCancel,
  onSubmit,
  submitLoading,
  closeButtonDisabled,
  submitButtonDisabled,
  closeButtonText,
  submitButtonText,
  showCloseButton = true
}: {
  id?: string
  onCancel?: (isHeader: boolean) => void
  onSubmit?: () => void
  submitLoading?: boolean
  closeButtonDisabled?: boolean
  submitButtonDisabled?: boolean
  closeButtonText?: string
  submitButtonText?: string
  showCloseButton?: boolean
}) => {
  const { t } = useTranslation()
  return (
    <div className="grid grid-flow-col border-t border-t-theme-primary px-6 py-5">
      {showCloseButton && (
        <Button
          data-testid="modal-cancel-button"
          variant="secondary"
          disabled={closeButtonDisabled}
          onClick={() => onCancel && onCancel(false)}
        >
          {closeButtonText || t('common:components.cancel')}
        </Button>
      )}
      {onSubmit && (
        <Button
          data-testid="modal-submit-button"
          disabled={submitButtonDisabled || submitLoading}
          onClick={onSubmit}
          className="place-self-end"
        >
          {submitButtonText || t('common:components.confirm')}
          {submitLoading ? <LoadingView spinnerOnly className="h-6 w-6" /> : undefined}
        </Button>
      )}
    </div>
  )
}

const Modal = ({
  id,
  title,
  onClose,
  onSubmit,
  hideFooter,
  rawChildren,
  children,
  className,
  submitLoading,
  closeButtonText,
  submitButtonText,
  closeButtonDisabled,
  submitButtonDisabled,
  showCloseButton = true
}: ModalProps) => {
  const twClassName = twMerge('relative z-50 w-full bg-theme-surface-main', className)
  return (
    <div data-test-id={id} className={twClassName}>
      <div className="relative rounded-lg shadow">
        {onClose && <ModalHeader title={title} onClose={onClose} />}
        {rawChildren}
        {children && <div className="h-fit max-h-[60vh] w-full overflow-y-auto px-10 py-6">{children}</div>}

        {!hideFooter && (
          <ModalFooter
            id={id}
            closeButtonText={closeButtonText}
            submitButtonText={submitButtonText}
            closeButtonDisabled={closeButtonDisabled}
            submitButtonDisabled={submitButtonDisabled}
            onCancel={onClose}
            onSubmit={onSubmit}
            submitLoading={submitLoading}
            showCloseButton={showCloseButton}
          />
        )}
      </div>
    </div>
  )
}

export default Modal
