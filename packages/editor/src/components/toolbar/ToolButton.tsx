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

import { InfoTooltip } from '../layout/Tooltip'

import './ToolButton.css'

const iconStyles = {
  //MUI icon styles
  width: '100%',
  height: '100%',
  fontSize: '14px',
  alignItems: 'center'
}

interface ToolButtonProp {
  id: string | number
  icon?: any
  onClick: (ev: any) => void
  isSelected?: boolean
  tooltip?: string
}

/**
 *
 * @param {any} id
 * @param {any} icon
 * @param {any} onClick
 * @param {any} isSelected
 * @param {any} tooltip
 * @returns
 */

export function ToolButton({ id, icon: Icon, onClick, isSelected, tooltip }: ToolButtonProp) {
  const toolButtonClassNames = ['toolButton', isSelected ? 'selected' : ''].join(' ')
  return (
    <InfoTooltip title={tooltip!} placement="bottom">
      <button id={id as string} className={toolButtonClassNames} onClick={onClick}>
        <Icon style={iconStyles} />
      </button>
    </InfoTooltip>
  )
}

export default ToolButton
