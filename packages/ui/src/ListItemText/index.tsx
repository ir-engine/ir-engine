import React, { ReactNode } from 'react'

import { ListItemTextProps, ListItemText as MuiListItemText } from '@mui/material'

const ListItemText = ({ children, ...props }: ListItemTextProps) => (
  <MuiListItemText {...props}>{children}</MuiListItemText>
)

ListItemText.displayName = 'ListItemText'

ListItemText.defaultProps = {
  children: null
}

export default ListItemText
