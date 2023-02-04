import React, { ReactNode } from 'react'

import { Tabs as MuiTabs, TabsProps } from '@mui/material'

const Tabs = (props: TabsProps) => <MuiTabs {...props} />

Tabs.displayName = 'Tabs'

Tabs.defaultProps = { children: null }

export default Tabs
