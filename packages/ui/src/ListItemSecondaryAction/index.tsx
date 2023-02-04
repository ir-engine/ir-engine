import React, { ReactNode } from 'react'

import { ListItemSecondaryAction as MuiListItemSecondaryAction } from '@mui/material'

export interface Props {
  children: ReactNode
}

const ListItemSecondaryAction = ({ children, ...props }: Props) => (
  <MuiListItemSecondaryAction {...props}>{children}</MuiListItemSecondaryAction>
)

ListItemSecondaryAction.displayName = 'ListItemSecondaryAction'

ListItemSecondaryAction.defaultProps = {
  children: null
}

export default ListItemSecondaryAction
