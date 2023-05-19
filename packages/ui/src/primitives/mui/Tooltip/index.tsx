import React from 'react'

import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'

import { Tooltip as MuiTooltip, TooltipProps } from '@mui/material'

const Tooltip = ({ children, ...props }: TooltipProps) => (
  <MuiTooltip {...props}>
    <span>{children}</span>
  </MuiTooltip>
)

Tooltip.displayName = 'Tooltip'

Tooltip.defaultProps = {
  children: <IconButton icon={<Icon type="Menu" />} />,
  title: 'Tooltip'
}

export default Tooltip
