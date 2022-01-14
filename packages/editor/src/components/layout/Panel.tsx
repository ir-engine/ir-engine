import React from 'react'
import styled from 'styled-components'

/**
 *
 *  @author Robert Long
 */
export const PanelIcon = (styled as any).div`
 color: #b6b6b6;
 margin-right: 8px;
`

/**
 *
 *  @author Robert Long
 */
export const PanelTitle = (styled as any).div`
 color: #b6b6b6;
 position: relative
`

/**
 *
 *  @author Hanzla  Mateen
 */
export const PanelDragContainer = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;

  &.dock-tab-active {

    ${PanelTitle} {
      color: white !important;
    }

    ${PanelIcon} {
      color: white !important;
    }
  }
`

/**
 *
 *  @author Robert Long
 */
export const PanelContainer = (styled as any).div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  border-radius: 4px;
  background-color: ${(props) => props.theme.panel};
  overflow: hidden;
  user-select: none;
`
/**
 *
 *  @author Robert Long
 */
export const PanelToolbar = (styled as any).div`
  display: flex;
  padding: 4px;
  height: 24px;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`

/**
 *
 *  @author Robert Long
 */
export const PanelContent = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`

/**
 *
 *  @author Robert Long
 */
export const Panel = (props) => {
  const { icon, title, children, toolbarContent, ...rest } = props

  return (
    <PanelContainer {...rest}>
      <PanelToolbar className="toolbar">
        {icon && <PanelIcon as={icon} size={12} />}
        <PanelTitle>{title}</PanelTitle>
        {toolbarContent}
      </PanelToolbar>
      <PanelContent>{children}</PanelContent>
    </PanelContainer>
  )
}

export default Panel
