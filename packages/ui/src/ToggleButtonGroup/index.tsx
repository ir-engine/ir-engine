import React, { ReactNode } from 'react'

import { ToggleButtonGroup as MuiToggleButtonGroup, ToggleButtonGroupProps } from '@mui/material'

const ToggleButtonGroup = (props: ToggleButtonGroupProps) => <MuiToggleButtonGroup {...props} />

ToggleButtonGroup.displayName = 'ToggleButtonGroup'

ToggleButtonGroup.defaultProps = {}

export default ToggleButtonGroup
