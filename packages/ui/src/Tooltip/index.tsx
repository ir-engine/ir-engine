import React, { ReactNode } from 'react'

import { Tooltip as MuiTooltip, TooltipProps } from '@mui/material'

import IconButton from '../IconButton'

const Tooltip = (props: TooltipProps) => <MuiTooltip {...props} />

Tooltip.displayName = 'Tooltip'

Tooltip.defaultProps = {
  children: (
    <>
      <IconButton />
    </>
  ),
  title: "I'm a tooltip"
}

export default Tooltip
