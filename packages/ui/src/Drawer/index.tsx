import React, { ReactNode } from 'react'

import { DrawerProps, Drawer as MuiDrawer } from '@mui/material'

const Drawer = (props: DrawerProps) => <MuiDrawer {...props} />

Drawer.displayName = 'Drawer'

Drawer.defaultProps = { children: null }

export default Drawer
