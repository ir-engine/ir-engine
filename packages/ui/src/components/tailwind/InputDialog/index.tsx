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
import { t } from 'i18next'
import React from 'react'

import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { useHookstate } from '@ir-engine/hyperflux'

import Input from '../../../primitives/tailwind/Input'
import Modal, { ModalProps } from '../../../primitives/tailwind/Modal'

interface InputDialogProps {
  title?: string
  fields: FieldOptions[]
  onSubmit: (fieldValues) => Promise<void> | void
  onClose?: () => void
  modalProps?: Partial<ModalProps>
}

interface FieldOptions {
  id: string
  label: string
  defaultValue?: string
  placeholder?: string
  validate?: (input: string) => void
}

export const InputDialog = ({ title, fields, onSubmit, onClose, modalProps }: InputDialogProps) => {
  const errorText = useHookstate('')
  const modalProcessing = useHookstate(false)

  const defaultValues = {}
  fields.forEach((field) => {
    defaultValues[field.id] = field.defaultValue || ''
  })

  const fieldValues = useHookstate(defaultValues)

  const handleSubmit = async () => {
    modalProcessing.set(true)
    try {
      await onSubmit(fieldValues.value)
      PopoverState.hidePopupover()
    } catch (error) {
      errorText.set(error.message)
    }
    modalProcessing.set(false)
  }

  const handleChange = (value: string, name: string, index: number) => {
    fields[index]?.validate?.(value)
    fieldValues[name].set(value)
  }

  return (
    <Modal
      title={title || t('admin:components.common.confirmation')}
      onSubmit={handleSubmit}
      onClose={() => {
        PopoverState.hidePopupover()
        onClose?.()
      }}
      className="w-[50vw] max-w-2xl"
      submitLoading={modalProcessing.value}
      {...modalProps}
    >
      <div className="flex gap-4">
        {fields.map((field, index) => (
          <Input
            key={field.id}
            value={fieldValues[field.id].value || ''}
            onChange={(e) => handleChange(e.target.value, field.id, index)}
            labelProps={{
              text: field.label,
              position: 'top'
            }}
            fullWidth
            placeholder={field.placeholder}
          />
        ))}
      </div>
    </Modal>
  )
}

export default InputDialog
