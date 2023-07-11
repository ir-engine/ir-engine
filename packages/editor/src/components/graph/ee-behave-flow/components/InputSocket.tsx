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
