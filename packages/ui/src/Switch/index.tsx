import React, { ReactNode } from 'react'

import { Switch as MuiSwitch, SwitchProps } from '@mui/material'

const Switch = (props: SwitchProps) => <MuiSwitch {...props} />

Switch.displayName = 'Switch'

Switch.defaultProps = {}

export default Switch
