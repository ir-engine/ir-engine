import React, { useCallback } from 'react'
import Portal from './Portal'
import Positioner from './Positioner'
import useHover from '../hooks/useHover'
import styled from 'styled-components'

/**
 *
 * @author Robert Long
 */
const StyledTooltip = (styled as any).div`
  display: inherit;
`

interface TooltipProp {
  children: any
  padding?: any
  position?: any
  renderContent?: any
  disabled?: boolean
}

/**
 *
 * @author Robert Long
 * @param {any} children
 * @param {any} padding
 * @param {any} position
 * @param {any} renderContent
 * @param {any} disabled
 * @param {any} rest
 * @returns
 */
export function Tooltip({ children, padding, position, renderContent, disabled, ...rest }: TooltipProp) {
  const [hoverRef, isHovered] = useHover()

  const getTargetRef = useCallback(() => {
    return hoverRef
  }, [hoverRef])

  return (
    <StyledTooltip ref={hoverRef} {...rest}>
      {children}
      {isHovered && (
        <Portal>
          <Positioner getTargetRef={getTargetRef} padding={padding} position={position}>
            {renderContent()}
          </Positioner>
        </Portal>
      )}
    </StyledTooltip>
  )
}

/**
 *
 * @author Robert Long
 */
export const TooltipContainer = (styled as any).div`
  display: inline-block;
  pointer-events: none;
  background-color: rgba(21, 23, 27, 0.8);
  border-radius: 3px;
  font-size: 13px;
  padding: 8px;
  max-width: 200px;
  overflow: hidden;
  overflow-wrap: break-word;
  user-select: none;
  text-align: center;
  white-space: pre-wrap;
}
`

/**
 *
 * @author Robert Long
 * @param {any} info
 * @param {any} children
 * @param {any} rest
 * @returns
 */
export function InfoTooltip({ info, children, ...rest }) {
  if (!info) {
    return <div {...rest}>{children}</div>
  }

  return (
    <Tooltip {...rest} renderContent={() => <TooltipContainer>{info}</TooltipContainer>}>
      {children}
    </Tooltip>
  )
}

export default Tooltip
