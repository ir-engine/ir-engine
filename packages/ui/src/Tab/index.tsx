import React, { ReactNode } from 'react'

import { Tab as MuiTab, TabProps } from '@mui/material'

const Tab = (props: TabProps) => <MuiTab {...props} />

Tab.displayName = 'Tab'

Tab.defaultProps = {}

export default Tab
