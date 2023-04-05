import React, { ReactNode } from 'react'

import { ToggleButtonGroup as MuiToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material'

import ToggleButton from '../ToggleButton'

const ToggleButtonGroup = (props: ToggleButtonGroupProps) => <MuiToggleButtonGroup {...props} />

ToggleButtonGroup.displayName = 'ToggleButtonGroup'

ToggleButtonGroup.defaultProps = {
  value: 'default',
  children: <ToggleButton />
}

export default ToggleButtonGroup
