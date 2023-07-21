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
import cx from 'classnames'
import React from 'react'
import { Connection, Handle, Position, useReactFlow } from 'reactflow'

import { NodeSpecJSON, OutputSocketSpecJSON } from '@etherealengine/engine/src/behave-graph/core'

import { colors, valueTypeColorMap } from '../util/colors.js'
import { isValidConnection } from '../util/isValidConnection.js'

export type OutputSocketProps = {
  connected: boolean
  specJSON: NodeSpecJSON[]
} & OutputSocketSpecJSON

export default function OutputSocket({ specJSON, connected, valueType, name }: OutputSocketProps) {
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
    <div style={{ display: 'flex', flexGrow: 1, alignItems: 'center', justifyContent: 'flex-end', height: '1.75rem' }}>
      {showName && <div style={{ textTransform: 'capitalize' }}>{name}</div>}
      {isFlowSocket && <FontAwesomeIcon icon={faCaretRight} color="#ffffff" size="lg" className="ml-1" />}

      <Handle
        id={name}
        type="source"
        position={Position.Right}
        className="socket-output-handle"
        style={{
          backgroundColor: connected ? backgroundColor : '#2d3748', // Equivalent to 'bg-gray-800' in Tailwind
          borderColor: borderColor
        }}
        isValidConnection={(connection: Connection) => isValidConnection(connection, instance, specJSON)}
      />
    </div>
  )
}
