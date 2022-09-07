import React from 'react'
import styled from 'styled-components'

export const PanelIcon = (styled as any).div`
  color: var(--textColor);
  margin-right: 6px;
  width: 18px;
`

export const PanelTitle = (styled as any).div`
  color: var(--textColor);
  position: relative;
`

export const PanelCheckbox = (styled as any).div`
  color: var(--textColor);
  position: relative;
  padding: 0px;
`

export const PanelDragContainer = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  padding: 0px;

  &.dock-tab-active {
    ${PanelTitle} {
      color: white !important;
    }

    ${PanelIcon} {
      color: white !important;
    }
  }
`

export const PanelContainer = (styled as any).div`
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  border-radius: 4px;
  background-color: var(--dockBackground);
  overflow: hidden;
  user-select: none;
`

export const PanelToolbar = (styled as any).div`
  display: flex;
  padding: 4px;
  height: 24px;
  align-items: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`

export const PanelContent = (styled as any).div`
  display: flex;
  flex: 1;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`

export const Panel = ({ icon, title, children, toolbarContent, ...rest }) => {
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
