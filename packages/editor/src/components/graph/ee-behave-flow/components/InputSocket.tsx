import { faCaretRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { InputSocketSpecJSON } from 'behave-graph'
import React from 'react'
import { Connection, Handle, Position, useReactFlow } from 'reactflow'

import styles from '../styles.module.scss'
import { colors, valueTypeColorMap } from '../util/colors'
import { isValidConnection } from '../util/isValidConnection'
import { AutoSizeInput } from './AutoSizeInput'

export type InputSocketProps = {
  connected: boolean
  value: any | undefined
  onChange: (key: string, value: any) => void
} & InputSocketSpecJSON

export default function InputSocket({ connected, value, onChange, name, valueType, defaultValue }: InputSocketProps) {
  const instance = useReactFlow()
  const isFlowSocket = valueType === 'flow'

  let colorName = valueTypeColorMap[valueType]
  if (colorName === undefined) {
    colorName = 'red'
  }

  const [backgroundColor, borderColor] = colors[colorName]
  const showName = isFlowSocket === false || name !== 'flow'

  return (
    <div className={styles.inputSocket}>
      {isFlowSocket && <FontAwesomeIcon icon={faCaretRight} color="#ffffff" size="lg" />}
      {showName && <div className={styles.socketName}>{name}</div>}
      {isFlowSocket === false && connected === false && (
        <>
          {valueType === 'string' && (
            <AutoSizeInput
              type="text"
              className={styles.inputField}
              value={String(value) ?? defaultValue ?? ''}
              onChange={(e) => onChange(name, e.currentTarget.value)}
            />
          )}
          {valueType === 'number' && (
            <AutoSizeInput
              type="number"
              className={styles.inputField}
              value={String(value) ?? defaultValue ?? ''}
              onChange={(e) => onChange(name, e.currentTarget.value)}
            />
          )}
          {valueType === 'float' && (
            <AutoSizeInput
              type="number"
              className={styles.inputField}
              value={String(value) ?? defaultValue ?? ''}
              onChange={(e) => onChange(name, e.currentTarget.value)}
            />
          )}
          {valueType === 'integer' && (
            <AutoSizeInput
              type="number"
              className={styles.inputField}
              value={String(value) ?? defaultValue ?? ''}
              onChange={(e) => onChange(name, e.currentTarget.value)}
            />
          )}
          {valueType === 'boolean' && (
            <input
              type="checkbox"
              className={styles.inputField}
              value={String(value) ?? defaultValue ?? ''}
              onChange={(e) => onChange(name, e.currentTarget.checked)}
            />
          )}
        </>
      )}
      <Handle
        id={name}
        type="target"
        position={Position.Left}
        className={styles.handle}
        isValidConnection={(connection: Connection) => isValidConnection(connection, instance)}
      />
    </div>
  )
}
