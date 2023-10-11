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
import React from 'react'
import { Connection, Handle, Position, useReactFlow } from 'reactflow'

import { InputSocketSpecJSON } from '@behave-graph/core'

import { NodeSpecGenerator } from '../hooks/useNodeSpecGenerator'
import { colors, valueTypeColorMap } from '../util/colors'
import { isValidConnection } from '../util/isValidConnection'
import { AutoSizeInput } from './AutoSizeInput'

export type InputSocketProps = {
  connected: boolean
  value: any | undefined
  onChange: (key: string, value: any) => void
  specGenerator: NodeSpecGenerator
} & InputSocketSpecJSON

const InputFieldForValue = ({
  choices,
  value,
  defaultValue,
  onChange,
  name,
  valueType
}: Pick<InputSocketProps, 'choices' | 'value' | 'defaultValue' | 'name' | 'onChange' | 'valueType'>) => {
  const showChoices = choices?.length
  const inputVal = String(value) ?? defaultValue ?? ''
  const inputSocketStyle = {
    backgroundColor: 'var(--panelCards)',
    cursor: 'pointer',
    padding: '0 .5rem',
    userDrag: 'none',
    marginRight: '0.5rem',
    WebkitUserDrag: 'none',
    MozUserDrag: 'none'
  }
  if (showChoices)
    return (
      <select
        className="socket-input choice"
        style={inputSocketStyle}
        value={value ?? defaultValue ?? ''}
        onChange={(e) => onChange(name, e.currentTarget.value)}
      >
        <>
          {choices.map((choice) => (
            <option key={choice.text} value={choice.value}>
              {choice.text}
            </option>
          ))}
        </>
      </select>
    )

  return (
    <>
      {valueType === 'string' && (
        <AutoSizeInput
          type="text"
          className="socket-input string"
          style={inputSocketStyle}
          value={inputVal}
          onChange={(e) => onChange(name, e.currentTarget.value)}
        />
      )}
      {valueType === 'number' && (
        <AutoSizeInput
          type="number"
          className="socket-input number"
          style={inputSocketStyle}
          value={inputVal}
          onChange={(e) => onChange(name, e.currentTarget.value)}
        />
      )}
      {valueType === 'float' && (
        <AutoSizeInput
          type="number"
          className="socket-input float"
          style={inputSocketStyle}
          value={inputVal}
          onChange={(e) => onChange(name, e.currentTarget.value)}
        />
      )}
      {valueType === 'integer' && (
        <AutoSizeInput
          type="number"
          className="socket-input integer"
          style={inputSocketStyle}
          value={inputVal}
          onChange={(e) => onChange(name, e.currentTarget.value)}
        />
      )}
      {valueType === 'boolean' && (
        <input
          type="checkbox"
          className="socket-input boolean"
          style={inputSocketStyle}
          value={inputVal}
          checked={value}
          onChange={(e) => onChange(name, e.currentTarget.checked)}
        />
      )}
    </>
  )
}

const InputSocket: React.FC<InputSocketProps> = ({ connected, specGenerator, ...rest }) => {
  const { name, valueType } = rest
  const instance = useReactFlow()
  const isFlowSocket = valueType === 'flow'

  let colorName = valueTypeColorMap[valueType]
  if (colorName === undefined) {
    colorName = 'red'
  }

  // @ts-ignore
  const [backgroundColor, borderColor] = colors[colorName]
  const showName = isFlowSocket === false || name !== 'flow'

  return (
    <div
      style={{
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        position: 'relative',
        justifyContent: 'flex-start',
        height: '1.75rem'
      }}
    >
      {isFlowSocket && <FontAwesomeIcon icon={faCaretRight} color="#ffffff" size="lg" />}
      {showName && <div style={{ textTransform: 'capitalize', marginRight: '1rem', marginLeft: '0.5rem' }}>{name}</div>}

      {!isFlowSocket && !connected && <InputFieldForValue {...rest} />}
      <Handle
        id={name}
        type="target"
        position={Position.Left}
        className="socket-input-handle"
        style={{
          marginLeft: 'auto',
          backgroundColor: connected ? backgroundColor : 'var(--mainBackground)',
          borderColor: borderColor,
          width: '10px',
          height: '10px',
          left: '-12px'
        }}
        isValidConnection={(connection: Connection) => isValidConnection(connection, instance, specGenerator)}
      />
    </div>
  )
}

export default InputSocket
