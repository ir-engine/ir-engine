import React from 'react'
import styled from 'styled-components'
import { InfoTooltip } from '../layout/Tooltip'

/**
 *
 * @author Robert Long
 */
const StyledToolButton = (styled as any).button`
  width: 40px;
  height: 40px;
  border: none;
  color: ${(props) => props.theme.white};
  cursor: pointer;
  position: relative;

  background-color: ${(props) => (props.isSelected ? props.theme.blue : props.theme.toolbar)};

  &:hover {
    background-color: ${(props) => (props.isSelected ? props.theme.blueHover : props.theme.panel)};
  }
`

/**
 *
 * @author Robert Long
 */
const Icon = (styled as any).div`
  width: 14px;
  height: 14px;
  font-size: 14px;
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
 * @author Robert Long
 * @param {any} id
 * @param {any} icon
 * @param {any} onClick
 * @param {any} isSelected
 * @param {any} tooltip
 * @returns
 */
export function ToolButton({ id, icon, onClick, isSelected, tooltip }: ToolButtonProp) {
  return (
    <InfoTooltip id={id} info={tooltip} position="bottom">
      <StyledToolButton isSelected={isSelected} onClick={onClick}>
        <Icon as={icon} />
      </StyledToolButton>
    </InfoTooltip>
  )
}

export default ToolButton
