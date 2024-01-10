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

const listItemStyles = (selected) => ({
  display: 'flex',
  flexDirection: 'row',
  outline: 'none',
  overflow: 'hidden',
  userSelect: 'none',
  minHeight: '24px',
  padding: '0 4px',
  alignItems: 'center',
  color: 'var(--textColor)',
  backgroundColor: selected ? 'var(--dropdownMenuHoverBackground)' : 'var(--dropdownMenuBackground)',
  '&:nthChild(odd)': {
    backgroundColor: selected ? 'var(--dropdownMenuHoverBackground)' : 'var(--dropdownMenuBackground)'
  },
  '&:hover, &:focus': {
    backgroundColor: selected ? 'var(--blueHover)' : 'var(--dropdownMenuHoverBackground)',
    color: 'var(--textColor)'
  },
  '&:active': {
    backgroundColor: 'var(--bluePressed)',
    color: 'var(--textColor)'
  }
})

const listItemActiveStyles = {
  backgroundColor: 'var(--bluePressed)',
  color: 'var(--textColor)'
}

const listItemIconStyles = {
  width: '12px',
  height: '12px',
  marginRight: '4px'
}

export function ListItem({ children, ...rest }) {
  const { selected } = rest
  return (
    <li style={listItemStyles(selected) as React.CSSProperties} {...rest}>
      {children}
    </li>
  )
}

export function ListItemIcon({ as: IconComponent }) {
  return <div style={listItemIconStyles}>{IconComponent && <IconComponent />}</div>
}

export function IconListItem({ iconComponent, children, ...rest }) {
  return (
    <ListItem {...rest}>
      <ListItemIcon as={iconComponent} />
      {children}
    </ListItem>
  )
}

export function List({ children }) {
  return <ul style={{ listStyle: 'none', height: '100%', overflowY: 'auto' }}>{children}</ul>
}
