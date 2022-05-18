import React from 'react'
import styled from 'styled-components'

/**
 * @author Robert Long
 */
export const ListItem = (styled as any).li`
  display: flex;
  flex-direction: row;
  outline: none;
  overflow: hidden;
  user-select: none;
  min-height: 24px;
  padding: 0 4px;
  align-items: center;
  color: var(--text);

  background-color: ${(props) => (props.selected ? 'var(--selected)' : 'var(--panel2)')};

  :nth-child(odd) {
    background-color: ${(props) => (props.selected ? 'var(--selected)' : 'var(--dock)')};
  }

  :hover,
  :focus {
    background-color: ${(props) => (props.selected ? 'var(--blueHover)' : 'var(--hover)')};
    color: var(--text);
  }

  :active {
    background-color: var(--bluePressed);
    color: var(--text);
  }
`

/**
 *
 * @author Robert Long
 */
const ListItemIcon = (styled as any).div`
  width: 12px;
  height: 12px;
  margin-right: 4px;
`

/**
 *
 * @author Robert Long
 * @param {any} iconComponent
 * @param {any} children
 * @param {any} rest
 * @returns
 */
export function IconListItem({ iconComponent, children, ...rest }) {
  return (
    <ListItem {...rest}>
      <ListItemIcon as={iconComponent} />
      {children}
    </ListItem>
  )
}

export const List = (styled as any).ul`
  height: 100%;
  overflow-y: auto;
`
