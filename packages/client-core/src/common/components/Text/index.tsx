import React from 'react'

import { SxProps, Theme } from '@mui/material/styles'
import { Variant } from '@mui/material/styles/createTypography'
import Typography from '@mui/material/Typography'

interface Props {
  children?: React.ReactNode
  className?: string
  sx?: SxProps<Theme>
  variant?: Variant
}

const Button = ({ children, className, sx, variant }: Props) => {
  return (
    <Typography className={`${className ?? ''}`} sx={sx} variant={variant}>
      {children}
    </Typography>
  )
}

export default Button
