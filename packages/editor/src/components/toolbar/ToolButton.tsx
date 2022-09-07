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
