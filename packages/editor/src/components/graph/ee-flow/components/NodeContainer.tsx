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

import cx from 'classnames'
import React, { PropsWithChildren } from 'react'

import { NodeCategory, NodeSpecJSON } from '@etherealengine/engine/src/behave-graph/core'

import { categoryColorMap, colors } from '../util/colors.js'

type NodeProps = {
  title: string
  category?: NodeSpecJSON['category']
  selected: boolean
}

const NodeContainer: React.FC<PropsWithChildren<NodeProps>> = ({
  title,
  category = NodeCategory.None,
  selected,
  children
}) => {
  let colorName = categoryColorMap[category]
  if (colorName === undefined) {
    colorName = 'red'
  }
  let [backgroundColor, borderColor, textColor] = colors[colorName]
  if (selected) {
    borderColor = 'border-gray-800'
  }
  return (
    <div className={cx('rounded text-white text-sm bg-gray-800 min-w-[120px]', selected && 'outline outline-1')}>
      <div className={`${backgroundColor} ${textColor} px-2 py-1 rounded-t`}>{title}</div>
      <div className={`flex flex-col gap-2 py-2 border-l border-r border-b ${borderColor} `}>{children}</div>
    </div>
  )
}

export default NodeContainer
