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

import React from 'react'
import { FaCaretRight } from 'react-icons/fa6'
import { Connection, Handle, Position, useReactFlow } from 'reactflow'

import {
  NodeSpecGenerator,
  isValidConnection
} from '@etherealengine/editor/src/components/visualScript/VisualScriptUIModule'
import { OutputSocketSpecJSON } from '@etherealengine/visual-script'
import { twMerge } from 'tailwind-merge'
import { colors, valueTypeColorMap } from '../../../util/colors'

export type OutputSocketProps = {
  connected: boolean
  specGenerator: NodeSpecGenerator
  collapsed: boolean
  offset: any
} & OutputSocketSpecJSON

export default function OutputSocket({ specGenerator, connected, ...rest }: OutputSocketProps) {
  const { name, valueType, collapsed, offset } = rest

  const instance = useReactFlow()
  const isFlowSocket = valueType === 'flow'
  let colorName = valueTypeColorMap[valueType]
  if (colorName === undefined) {
    colorName = 'red'
  }
  // @ts-ignore
  const [backgroundColor, borderColor] = colors[colorName]
  const showName = isFlowSocket === false || name !== 'flow'
  const position = {} as any
  if (offset?.x !== undefined) position['right'] = `${offset.x}%`
  if (offset?.y !== undefined) position['top'] = `${offset.y}%`

  return (
    <div
      className={twMerge('flex-end relative flex h-4 grow items-center justify-end', collapsed ? 'absolute' : '')}
      style={position as any}
    >
      {showName && !collapsed && <div className="ml-2 mr-4 capitalize">{name}</div>}
      {isFlowSocket && (
        <FaCaretRight
          color="#ffffff"
          size="1.25rem"
          className="ml-1"
          style={{
            marginLeft: '0.25rem'
          }}
        />
      )}

      <Handle
        id={name}
        type="source"
        position={Position.Right}
        className={twMerge(
          'socket-output-handle',
          connected ? backgroundColor : 'bg-white',
          borderColor,
          'h-2.5 w-2.5',
          collapsed ? '' : 'right-[-12px]'
        )}
        isValidConnection={(connection: Connection) => isValidConnection(connection, instance, specGenerator)}
      />
    </div>
  )
}
