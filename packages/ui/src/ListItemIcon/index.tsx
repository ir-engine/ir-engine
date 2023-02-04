import React, { ReactNode } from 'react'

import { ListItemIconProps, ListItemIcon as MuiListItemIcon } from '@mui/material'

const ListItemIcon = (props: ListItemIconProps) => <MuiListItemIcon {...props} />

ListItemIcon.displayName = 'ListItemIcon'

ListItemIcon.defaultProps = { children: null }

export default ListItemIcon
