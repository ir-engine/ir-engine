import React, { ReactNode } from 'react'

import { MenuItemProps, MenuItem as MuiMenuItem } from '@mui/material'

const MenuItem = (props: MenuItemProps) => <MuiMenuItem {...props} />

MenuItem.displayName = 'MenuItem'

MenuItem.defaultProps = { children: null }

export default MenuItem
