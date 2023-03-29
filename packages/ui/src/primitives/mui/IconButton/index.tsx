import React, { ReactNode } from 'react'

import CloseIcon from '@mui/icons-material/Close'
import { IconButtonProps, default as MUIIconButton } from '@mui/material/IconButton'

import { handleSoundEffect } from '../../../../../client-core/src/common/utils'
import styles from './index.module.scss'

const IconButton = ({
  background,
  className,
  color,
  edge,
  disabled,
  disableRipple,
  icon,
  id,
  size, // 'small' | 'medium' | 'large'
  sizePx,
  sx,
  title,
  type, // 'default' | 'glow' | 'gradient' | 'solid'
  onClick,
  ...props
}: IconButtonProps & {
  background?: string
  icon?: React.ReactNode
  sizePx?: number
  type?: any
}) => {
  let baseStyle = styles.iconButton

  if (type === 'glow') {
    baseStyle = `${baseStyle} ${styles.iconButtonGlow}`
  } else if (type === 'gradient') {
    baseStyle = `${baseStyle} ${styles.iconButtonGradient}`
  } else if (type === 'solid') {
    baseStyle = `${baseStyle} ${styles.iconButtonSolid}`
  }

  return (
    <MUIIconButton
      id={id}
      className={`${baseStyle} ${background ? styles.backgroundStyle : ''} ${className ?? ''}`}
      disabled={disabled}
      disableRipple={disableRipple}
      size={size}
      edge={edge}
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
      {...props}
    >
      {icon}
    </MUIIconButton>
  )
}

IconButton.displayName = 'IconButton'

IconButton.defaultProps = {
  icon: <CloseIcon />
}

export default IconButton
