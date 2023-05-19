import React, { ReactNode } from 'react'

import Tab from '@etherealengine/ui/src/primitives/mui/Tab'

import { Tabs as MuiTabs, TabsProps } from '@mui/material'

const Tabs = (props: TabsProps) => <MuiTabs {...props} />

Tabs.displayName = 'Tabs'

Tabs.defaultProps = { value: 0, children: <Tab /> }

export default Tabs
