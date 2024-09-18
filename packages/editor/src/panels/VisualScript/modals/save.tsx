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

import React, { useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useEdges, useNodes } from 'reactflow'

import { VariableJSON } from '@ir-engine/visual-script'

import { Modal } from '.'
import { NodeSpecGenerator, flowToVisual } from '../../../components/VisualScript/VisualScriptUIModule'

export type SaveModalProps = {
  open?: boolean
  variables: VariableJSON[]
  onClose: () => void
  specGenerator: NodeSpecGenerator
}

export const SaveModal: React.FC<SaveModalProps> = ({ open = false, variables, onClose, specGenerator }) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)
  const { t } = useTranslation()

  const edges = useEdges()
  const nodes = useNodes()

  const flow = useMemo(() => flowToVisual(nodes, edges, variables, specGenerator), [nodes, edges, specGenerator])

  const jsonString = JSON.stringify(flow, null, 2)

  const handleCopy = () => {
    ref.current?.select()
    document.execCommand('copy')
    ref.current?.blur()
    setCopied(true)
    setInterval(() => {
      setCopied(false)
    }, 1000)
  }

  return (
    <Modal
      title={t('editor:visualScript.modal.save')}
      actions={[
        { label: t('editor:visualScript.modal.buttons.cancel'), onClick: onClose },
        {
          label: copied
            ? t('editor:visualScript.modal.buttons.copy.done')
            : t('editor:visualScript.modal.buttons.copy.begin'),
          onClick: handleCopy
        }
      ]}
      open={open}
      onClose={onClose}
    >
      <textarea
        ref={ref}
        className="m-0 h-32 w-full border border-neutral-700 bg-neutral-800 p-2 text-neutral-100"
        defaultValue={jsonString}
      ></textarea>
    </Modal>
  )
}
