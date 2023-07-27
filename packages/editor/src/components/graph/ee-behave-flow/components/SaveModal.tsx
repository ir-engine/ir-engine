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

import React, { FC, useMemo, useRef, useState } from 'react'
import { useEdges, useNodes } from 'reactflow'

import styles from '../styles.module.scss'
import { flowToBehave } from '../transformers/flowToBehave'
import { Modal } from './Modal'

export type SaveModalProps = { open?: boolean; onClose: () => void }

export const SaveModal: FC<SaveModalProps> = ({ open = false, onClose }) => {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)

  const edges = useEdges()
  const nodes = useNodes()

  const flow = useMemo(() => flowToBehave(nodes, edges), [nodes, edges])

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
      title="Save Graph"
      actions={[
        { label: 'Cancel', onClick: onClose },
        { label: copied ? 'Copied' : 'Copy', onClick: handleCopy }
      ]}
      open={open}
      onClose={onClose}
    >
      <textarea className={styles.saveTextArea} ref={ref} defaultValue={jsonString}></textarea>
    </Modal>
  )
}
