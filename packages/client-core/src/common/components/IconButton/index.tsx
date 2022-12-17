import React from 'react'

import { default as MUIIconButton } from '@mui/material/IconButton'
import { SxProps, Theme } from '@mui/material/styles'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  background?: string
  className?: string
  disabled?: boolean
  disableRipple?: boolean
  icon?: React.ReactNode
  id?: string
  size?: 'small' | 'medium' | 'large'
  sizePx?: number
  sx?: SxProps<Theme>
  title?: string
  type?: 'default' | 'glow' | 'gradient'
  onClick?: (e) => void
}

const IconButton = ({
  background,
  className,
  disabled,
  disableRipple,
  icon,
  id,
  size,
  sizePx,
  sx,
  title,
  type,
  onClick
}: Props) => {
  let baseStyle = styles.iconButton

  if (type === 'glow') {
    baseStyle = `${baseStyle} ${styles.iconButtonGlow}`
  } else if (type === 'gradient') {
    baseStyle = `${baseStyle} ${styles.iconButtonGradient}`
  }

  return (
    <MUIIconButton
      id={id}
      className={`${baseStyle} ${background ? styles.backgroundStyle : ''} ${className ?? ''}`}
      disabled={disabled}
      disableRipple={disableRipple}
      size={size}
      sx={{
        height: sizePx ? `${sizePx}px` : 'auto',
        width: sizePx ? `${sizePx}px` : 'auto',
        background: background ? `${background} !important` : 'auto',
        ...sx
      }}
      title={title}
      onClick={onClick}
      onPointerUp={handleSoundEffect}
      onPointerEnter={handleSoundEffect}
    >
      {icon}
    </MUIIconButton>
  )
}

export default IconButton
