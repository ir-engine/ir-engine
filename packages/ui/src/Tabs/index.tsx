import React, { ReactNode } from 'react'

import { Tabs as MuiTabs, TabsProps } from '@mui/material'

import Tab from '../Tab'

const Tabs = (props: TabsProps) => <MuiTabs {...props} />

Tabs.displayName = 'Tabs'

Tabs.defaultProps = { value: 0, children: <Tab /> }

export default Tabs
