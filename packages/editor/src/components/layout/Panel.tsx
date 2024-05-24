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

import React, { ReactNode } from 'react'

// const panelDragContainerStyles = {
//   display: 'flex',
//   flex: 1,
//   flexDirection: 'row',
//   alignItems: 'center',
//   padding: '0px',

//   '&.dockTabActive': {
//     '& > div': {
//       color: 'white !important'
//     }
//   }
// }

export const PanelIcon = ({ as: IconComponent, size = 12 }) => {
  return <IconComponent className="mr-[6px] w-[18px] text-[var(--textColor)]" size={size} />
}

export const PanelTitle = ({ children }) => {
  return <div className="relative text-[var(--textColor)]">{children}</div>
}

// export const PanelTitle = ({ children }) => {
//   return (
//     <Text fontSize="sm" fontFamily="Figtree" className="leading-none">
//       {children}
//     </Text>
//   )
// }

export const PanelCheckbox = ({ children }) => {
  return <div className="relative p-0 text-[var(--textColor)]">{children}</div>
}

// export const PanelDragContainer = ({ children }) => {
//   return <div style={panelDragContainerStyles as React.CSSProperties}>{children}</div>
// }

export const PanelDragContainer = ({ children }) => {
  return <div className="bg-theme-surface-main cursor-pointer rounded-t-md px-4 py-1">{children}</div>
}

export const PanelContainer = ({ children, ...rest }) => {
  return (
    <div
      className="relative flex flex-1 select-none flex-col overflow-hidden rounded bg-[var(--dockBackground)]"
      {...rest}
    >
      {children}
    </div>
  )
}

export const PanelToolbar = ({ children }) => {
  return <div className="toolbar flex h-6 items-center border-b border-black border-opacity-20 p-1">{children}</div>
}

export const PanelContent = ({ children }) => {
  return <div className="relative flex flex-1 flex-col overflow-hidden">{children}</div>
}

interface PanelProps {
  icon?: React.ElementType
  title: string
  toolbarContent?: React.ReactNode
  children?: ReactNode
  // Add any other props you want to accept
}

const Panel: React.FC<PanelProps> = ({ icon, title, children, toolbarContent, ...rest }) => {
  return (
    <PanelContainer {...rest}>
      <PanelToolbar>
        {icon && <PanelIcon as={icon} size={12} />}
        <PanelTitle>{title}</PanelTitle>
        {toolbarContent}
      </PanelToolbar>
      <PanelContent>{children}</PanelContent>
    </PanelContainer>
  )
}

export default Panel
