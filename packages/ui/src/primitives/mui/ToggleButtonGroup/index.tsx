import React, { ReactNode } from 'react'

import ToggleButton from '@etherealengine/ui/src/primitives/mui/ToggleButton'

import { ToggleButtonGroup as MuiToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material'

const ToggleButtonGroup = (props: ToggleButtonGroupProps) => <MuiToggleButtonGroup {...props} />

ToggleButtonGroup.displayName = 'ToggleButtonGroup'

ToggleButtonGroup.defaultProps = {
  value: 'default',
  children: <ToggleButton />
}

export default ToggleButtonGroup
