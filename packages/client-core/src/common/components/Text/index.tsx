import React from 'react'

import { SxProps, Theme } from '@mui/material/styles'
import { Variant } from '@mui/material/styles/createTypography'
import Typography from '@mui/material/Typography'

interface Props {
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  children?: React.ReactNode
  className?: string
  margin?: string | number
  marginTop?: string | number
  marginBottom?: string | number
  marginLeft?: string | number
  marginRight?: string | number
  mt?: string | number
  mb?: string | number
  ml?: string | number
  mr?: string | number
  sx?: SxProps<Theme>
  variant?: Variant
}

const Button = ({
  align,
  children,
  className,
  margin,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  mt,
  mb,
  ml,
  mr,
  sx,
  variant
}: Props) => {
  return (
    <Typography
      align={align}
      className={className}
      margin={margin}
      marginTop={mt ?? marginTop}
      marginBottom={mb ?? marginBottom}
      marginLeft={ml ?? marginLeft}
      marginRight={mr ?? marginRight}
      sx={{ display: 'block', ...sx }}
      variant={variant}
    >
      {children}
    </Typography>
  )
}

export default Button
