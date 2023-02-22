import React from 'react'

import { Tooltip as MuiTooltip, TooltipProps } from '@mui/material'

const Tooltip = (props: TooltipProps) => <MuiTooltip {...props} />

Tooltip.displayName = 'Tooltip'

Tooltip.defaultProps = {}

export default Tooltip
