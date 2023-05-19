import React, { ReactNode } from 'react'

import Typography from '@etherealengine/ui/src/primitives/mui/Typography'

import { Paper as MuiPaper, PaperProps } from '@mui/material'

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
