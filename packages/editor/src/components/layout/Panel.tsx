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
