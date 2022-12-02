import React from 'react'

import { default as MUIButton } from '@mui/material/Button'
import { SxProps, Theme } from '@mui/material/styles'

import styles from './index.module.scss'

interface Props {
  autoFocus?: boolean
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  endIcon?: React.ReactNode
  startIcon?: React.ReactNode
  sx?: SxProps<Theme>
  type?: 'outlined' | 'gradient'
  onClick?: () => void
}

const Button = ({ autoFocus, children, className, disabled, endIcon, startIcon, sx, type, onClick }: Props) => {
  let baseStyle = ''
  if (type === 'outlined') {
    baseStyle = styles.outlinedButton
  } else if (type === 'gradient') {
    baseStyle = styles.gradientButton
  }

  return (
    <MUIButton
      autoFocus={autoFocus}
      className={`${baseStyle} ${className ?? ''}`}
      disabled={disabled}
      endIcon={endIcon}
      startIcon={startIcon}
      sx={sx}
      onClick={onClick}
    >
      {children}
    </MUIButton>
  )
}

export default Button
