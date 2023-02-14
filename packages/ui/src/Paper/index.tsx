import React, { ReactNode } from 'react'

import { Paper as MuiPaper, PaperProps } from '@mui/material'

import Typography from '../Typography'

const Paper = ({ children, ...props }: PaperProps & { component?: string }) => (
  <MuiPaper {...props}>{children}</MuiPaper>
)

Paper.displayName = 'Paper'

Paper.defaultProps = {
  children: (
    <>
      <Typography />
    </>
  )
}

export default Paper
