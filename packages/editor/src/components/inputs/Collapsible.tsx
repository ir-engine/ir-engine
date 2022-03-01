import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

/**
 * CollapsibleContainer used to provide styles for Collapsible div.
 *
 * @author Robert Long
 * @type {styled component}
 */
const CollapsibleContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
`

/**
 * CollapsibleLabel used to provide styles for Collapsible label.
 *
 * @author Robert Long
 * @type {styled container}
 */
const CollapsibleLabel = (styled as any).div`
  color: ${(props) => props.theme.text2};
  cursor: pointer;
  display: inline-block;

  :hover {
    color: ${(props) => props.theme.text};
  }
`

/**
 * CollapsibleContent used to provides styles to Collapsible content.
 *
 * @author Robert Long
 * @type {styled component}
 */
const CollapsibleContent = (styled as any).div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
`

/**
 * CollapseIcon used to provide styles to icon.
 *
 * @author Robert Long
 * @type  {styled component}
 */
const CollapseIcon = (styled as any).div``

/**
 * Collapsible used to render the view of component.
 *
 * @author Robert Long
 * @param       {string} label
 * @param       {boolean} open
 * @param       {node} children
 * @constructor
 */
export function Collapsible({ label, open, children }) {
  const [collapsed, setCollapsed] = useState(!open)

  /**
   * toggleCollapsed callback function used to handle toggle on collapse.
   *
   * @author Robert Long
   * @type {styled component}
   */
  const toggleCollapsed = useCallback(() => {
    setCollapsed((collapsed) => !collapsed)
  }, [setCollapsed])

  return (
    <CollapsibleContainer>
      <CollapsibleLabel onClick={toggleCollapsed}>
        <CollapseIcon as={collapsed ? ArrowRightIcon : ArrowDropDownIcon} size={14} collapsed={collapsed} />
        {label}
      </CollapsibleLabel>
      {!collapsed && <CollapsibleContent>{children}</CollapsibleContent>}
    </CollapsibleContainer>
  )
}

Collapsible.defaultProps = {
  open: false
}

export default Collapsible
