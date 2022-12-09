import React from 'react'

import { SxProps, Theme } from '@mui/material/styles'
import { Variant } from '@mui/material/styles/createTypography'
import Typography from '@mui/material/Typography'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  align?: 'inherit' | 'left' | 'center' | 'right' | 'justify'
  bold?: boolean
  children?: React.ReactNode
  className?: string
  color?: string
  id?: string
  italic?: boolean
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
  underline?: boolean
  variant?: Variant
  onClick?: () => void
}

const Button = ({
  align,
  bold,
  children,
  className,
  color,
  id,
  italic,
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
  underline,
  variant,
  onClick
}: Props) => {
  let baseStyle = ''
  if (onClick) {
    baseStyle = styles.buttonBehavior
  }

  return (
    <Typography
      align={align}
      className={`${baseStyle} ${className ?? ''}`}
      color={color}
      id={id}
      fontWeight={bold ? 900 : undefined}
      fontStyle={italic ? 'italic' : undefined}
      margin={margin}
      marginTop={mt ?? marginTop}
      marginBottom={mb ?? marginBottom}
      marginLeft={ml ?? marginLeft}
      marginRight={mr ?? marginRight}
      sx={{ display: 'block', textDecoration: underline ? 'underline' : '', ...sx }}
      variant={variant}
      onClick={onClick}
      onPointerUp={() => (onClick ? handleSoundEffect : undefined)}
      onPointerEnter={() => (onClick ? handleSoundEffect : undefined)}
    >
      {children}
    </Typography>
  )
}

export default Button
