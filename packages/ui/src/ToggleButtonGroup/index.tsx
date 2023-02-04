import React, { ReactNode } from 'react'

import { ToggleButtonGroup as MuiToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material'

const ToggleButtonGroup = (props: ToggleButtonGroupProps) => <MuiToggleButtonGroup {...props} />

ToggleButtonGroup.displayName = 'ToggleButtonGroup'

ToggleButtonGroup.defaultProps = {
  defaultChecked: true,
  inputProps: { 'aria-label': 'ToggleButtonGroup demo' }
}

export default ToggleButtonGroup
