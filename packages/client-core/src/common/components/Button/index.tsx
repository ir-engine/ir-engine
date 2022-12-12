import React from 'react'

import IconButton from '@xrengine/client-core/src/common/components/IconButton'
import Text from '@xrengine/client-core/src/common/components/Text'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import { default as MUIButton } from '@mui/material/Button'
import { SxProps, Theme } from '@mui/material/styles'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  autoFocus?: boolean
  children?: React.ReactNode
  className?: string
  disabled?: boolean
  disableRipple?: boolean
  endIcon?: React.ReactNode
  fullWidth?: boolean
  id?: string
  open?: boolean
  startIcon?: React.ReactNode
  sx?: SxProps<Theme>
  type?: 'outlined' | 'gradient' | 'gradientRounded' | 'solid' | 'solidRounded' | 'expander'
  width?: string
  onClick?: () => void
}

const Button = ({
  autoFocus,
  children,
  className,
  disabled,
  disableRipple,
  endIcon,
  fullWidth,
  id,
  open,
  startIcon,
  sx,
  type,
  width,
  onClick
}: Props) => {
  if (type === 'expander') {
    return (
      <Box
        id={id}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', ...sx }}
        onClick={onClick}
        onPointerUp={handleSoundEffect}
        onPointerEnter={handleSoundEffect}
      >
        <Text variant="body2">{children}</Text>
        <IconButton icon={open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />} />
      </Box>
    )
  }

  let baseStyle = ''
  if (type === 'outlined') {
    baseStyle = styles.outlinedButton
  } else if (type === 'gradient' || type === 'gradientRounded') {
    baseStyle = styles.gradientButton
  } else if (type === 'solid' || type === 'solidRounded') {
    baseStyle = styles.solidButton
  }

  if (type === 'gradientRounded' || type === 'solidRounded') {
    baseStyle = `${baseStyle} ${styles.roundedButton}`
  }

  return (
    <MUIButton
      autoFocus={autoFocus}
      className={`${baseStyle} ${className ?? ''}`}
      disabled={disabled}
      disableRipple={disableRipple}
      endIcon={endIcon}
      id={id}
      startIcon={startIcon}
      sx={{ width: width ? width : fullWidth ? '100%' : 'auto', ...sx }}
      onClick={onClick}
      onPointerUp={handleSoundEffect}
      onPointerEnter={handleSoundEffect}
    >
      {children}
    </MUIButton>
  )
}

export default Button
