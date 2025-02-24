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

import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReactFlow } from 'reactflow'

import SelectInput from '@ir-engine/ui/src/components/editor/input/Select'
import { GraphJSON } from '@ir-engine/visual-script'
import { Modal } from '.'

export type Examples = {
  [key: string]: GraphJSON
}

export type LoadModalProps = {
  open?: boolean
  onClose: () => void
  setVisualScript: (value: GraphJSON) => void
  examples: Examples
}

export const LoadModal: React.FC<LoadModalProps> = ({ open = false, onClose, setVisualScript, examples }) => {
  const [value, setValue] = useState<string>()
  const [selected, setSelected] = useState('')

  const instance = useReactFlow()
  const { t } = useTranslation()

  useEffect(() => {
    if (selected) {
      setValue(JSON.stringify(examples[selected], null, 2))
    }
  }, [selected, examples])

  const handleLoad = useCallback(() => {
    let visualScript
    if (value !== undefined) {
      visualScript = JSON.parse(value) as GraphJSON
    } else if (selected !== '') {
      visualScript = examples[selected]
    }

    if (visualScript === undefined) return

    setVisualScript(visualScript)

    // TODO better way to call fit vew after edges render
    setTimeout(() => {
      instance.fitView()
    }, 100)

    handleClose()
  }, [setVisualScript, value, instance])

  const handleClose = () => {
    setValue(undefined)
    setSelected('')
    onClose()
  }

  return (
    <Modal
      title={t('editor:visualScript.modal.load.title')}
      actions={[
        { label: t('editor:visualScript.modal.buttons.cancel'), onClick: handleClose },
        { label: t('editor:visualScript.modal.buttons.load'), onClick: handleLoad }
      ]}
      open={open}
      onClose={onClose}
    >
      <textarea
        autoFocus
        className="m-0 h-32 w-full border border-neutral-700 bg-neutral-800 p-2 text-neutral-100"
        placeholder="Paste JSON here"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
      ></textarea>
      <div className="p-4 text-center text-neutral-100">or</div>
      <div className="flex items-center justify-center">
        <SelectInput
          options={Object.keys(examples).map((key) => {
            return {
              label: key,
              value: key
            }
          })}
          value={selected}
          onChange={(val) => setSelected(val as string)}
        />
      </div>
    </Modal>
  )
}
