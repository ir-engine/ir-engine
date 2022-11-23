import React from 'react'
import { FC, useMemo, useRef, useState } from 'react'
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
