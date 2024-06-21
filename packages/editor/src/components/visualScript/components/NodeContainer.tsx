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

import React, { PropsWithChildren } from 'react'

import { categoryColorMap } from '@etherealengine/ui/src/components/editor/panels/VisualScript/util/colors'
import { NodeCategory, NodeSpecJSON } from '@etherealengine/visual-script'
import { colors } from '@mui/material'

const nodeContainerStyle = {
  borderRadius: '0.25rem',
  color: 'var(--textColor)',
  fontSize: 'small',
  backgroundColor: 'var(--panelBackground)',
  minWidth: '120px'
}

const nodeTitleStyle = {
  backgroundColor: 'var(--navbarBackground)',
  color: 'var(--textColor)',
  padding: '0.25rem 0.5rem',
  borderTopLeftRadius: '0.25rem',
  borderTopRightRadius: '0.25rem'
}

const nodeContent = {
  display: 'flex',
  gap: '0.5rem',
  paddingTop: '0.5rem',
  paddingBottom: '0.5rem',
  borderColor: 'var(--borderStyle)'
}

type NodeProps = {
  title: string
  category?: NodeSpecJSON['category']
  selected: boolean
  isGroup: boolean
}

const NodeContainer: React.FC<PropsWithChildren<NodeProps>> = ({
  title,
  category = NodeCategory.None,
  selected,
  isGroup = false,
  children
}) => {
  let colorName = categoryColorMap[category]
  if (colorName === undefined) {
    colorName = 'red'
  }
  const [backgroundColor, borderColor, textColor] = colors[colorName]
  const titleStyle = {
    backgroundColor,
    color: textColor
  }
  return (
    <div style={{ ...nodeContainerStyle, ...(selected && { outline: '2px solid #4a5568' }) }}>
      <div style={{ ...nodeTitleStyle, ...titleStyle }}>{title}</div>
      <div
        style={{
          flexDirection: 'column',
          ...nodeContent,
          ...{ borderColor: borderColor }
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default NodeContainer
