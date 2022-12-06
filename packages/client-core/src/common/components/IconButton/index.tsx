import React from 'react'

import { default as MUIIconButton } from '@mui/material/IconButton'
import { SxProps, Theme } from '@mui/material/styles'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  className?: string
  disabled?: boolean
  icon?: React.ReactNode
  size?: 'small' | 'medium' | 'large'
  sx?: SxProps<Theme>
  onClick?: () => void
}

const IconButton = ({ className, disabled, icon, size, sx, onClick }: Props) => {
  return (
    <MUIIconButton
      className={`${styles.iconButton} ${className ?? ''}`}
      disabled={disabled}
      size={size}
      sx={sx}
      onClick={onClick}
      onPointerUp={handleSoundEffect}
      onPointerEnter={handleSoundEffect}
    >
      {icon}
    </MUIIconButton>
  )
}

export default IconButton
