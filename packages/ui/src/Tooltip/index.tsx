import React from 'react'

import { Tooltip as MuiTooltip, TooltipProps } from '@mui/material'

import Icon from '../Icon'
import IconButton from '../IconButton'

const Tooltip = ({ children, ...props }: TooltipProps) => (
  <MuiTooltip {...props}>
    <span>{children}</span>
  </MuiTooltip>
)

Tooltip.displayName = 'Tooltip'

Tooltip.defaultProps = {
  children: <IconButton icon={<Icon type="Menu" />} />
}

export default Tooltip
