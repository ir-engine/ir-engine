import React from 'react'

import { default as MUIIconButton } from '@mui/material/IconButton'
import { SxProps, Theme } from '@mui/material/styles'

import styles from './index.module.scss'

interface Props {
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  size?: 'small' | 'medium' | 'large'
  sx?: SxProps<Theme>
  onClick?: () => void
}

const IconButton = ({ children, className, disabled, size, sx, onClick }: Props) => {
  return (
    <MUIIconButton
      className={`${styles.iconButton} ${className ?? ''}`}
      disabled={disabled}
      size={size}
      sx={sx}
      onClick={onClick}
    >
      {children}
    </MUIIconButton>
  )
}

export default IconButton
