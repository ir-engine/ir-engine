import React, { ReactNode } from 'react'

import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { Popover as MuiPopover, PopoverProps } from '@mui/material'

const Popover = ({ children, ...props }: PopoverProps & {}) => <MuiPopover {...props}>{children}</MuiPopover>

Popover.displayName = 'Popover'

Popover.defaultProps = {
  children: (
    <>
      <Typography />
    </>
  ),
  open: true
}

export default Popover
