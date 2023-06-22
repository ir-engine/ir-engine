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
import styled from 'styled-components'

import { InfoTooltip } from '../layout/Tooltip'

const StyledToolButton = (styled as any).button`
  width: 40px;
  height: 40px;
  border: none;
  color: var(--iconButtonColor);
  cursor: pointer;
  position: relative;
  background-color: ${(props) => (props.isSelected ? 'var(--iconButtonHoverColor)' : 'var(--toolbar)')};

  &:hover {
    background-color: ${(props) => (props.isSelected ? 'var(--iconButtonHoverColor)' : 'var(--iconButtonHoverColor)')};
  }
`

const Icon = (styled as any).div`
  width: '100%';
  height: '100%';
  font-size: 14px;
  align-items: center;
`

interface ToolButtonProp {
  id: string | number
  icon?: any
  onClick: Function
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
export function ToolButton({ id, icon, onClick, isSelected, tooltip }: ToolButtonProp) {
  return (
    <InfoTooltip title={tooltip!} placement="bottom">
      <StyledToolButton isSelected={isSelected} onClick={onClick} id={id}>
        <Icon as={icon} />
      </StyledToolButton>
    </InfoTooltip>
  )
}

export default ToolButton
