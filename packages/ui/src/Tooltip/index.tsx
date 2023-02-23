import React from 'react'

import { Tooltip as MuiTooltip, TooltipProps } from '@mui/material'

const Tooltip = ({ children, ...props }: TooltipProps) => (
  <MuiTooltip {...props}>
    <span>{children}</span>
  </MuiTooltip>
)

Tooltip.displayName = 'Tooltip'

Tooltip.defaultProps = {}

export default Tooltip
