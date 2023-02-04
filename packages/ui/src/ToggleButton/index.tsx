import React, { ReactNode } from 'react'

import { ToggleButton as MuiToggleButton, ToggleButtonProps } from '@mui/material'

const ToggleButton = (props: ToggleButtonProps) => <MuiToggleButton {...props} />

ToggleButton.displayName = 'ToggleButton'

ToggleButton.defaultProps = {
  value: true
}

export default ToggleButton
