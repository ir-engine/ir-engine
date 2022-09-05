import React from 'react'
import styled from 'styled-components'

export const ListItem = styledli`
  display: flex;
  flex-direction: row;
  outline: none;
  overflow: hidden;
  user-select: none;
  min-height: 24px;
  padding: 0 4px;
  align-items: center;
  color: var(--textColor);
  background-color: ${(props) =>
    props.selected ? 'var(--dropdownMenuHoverBackground)' : 'var(--dropdownMenuBackground)'};

  :nth-child(odd) {
    background-color: ${(props) =>
      props.selected ? 'var(--dropdownMenuHoverBackground)' : 'var(--dropdownMenuBackground)'};
  }

  :hover,
  :focus {
    background-color: ${(props) => (props.selected ? 'var(--blueHover)' : 'var(--dropdownMenuHoverBackground)')};
    color: var(--textColor);
  }

  :active {
    background-color: var(--bluePressed);
    color: var(--textColor);
  }
`

const ListItemIcon = styled.div`
  width: 12px;
  height: 12px;
  margin-right: 4px;
`

/**
 *
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

export const List = styledul`
  height: 100%;
  overflow-y: auto;
`
