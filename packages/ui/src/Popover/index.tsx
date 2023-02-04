import React, { ReactNode } from 'react'

import { Popover as MuiPopover, PopoverProps } from '@mui/material'

import Typography from '../Typography'

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
