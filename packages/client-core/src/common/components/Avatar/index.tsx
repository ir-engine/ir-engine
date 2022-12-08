import React from 'react'

import IconButton from '@xrengine/client-core/src/common/components/IconButton'

import CreateIcon from '@mui/icons-material/Create'
import Box from '@mui/material/Box'
import { SxProps, Theme } from '@mui/material/styles'

import styles from './index.module.scss'

interface Props {
  className?: string
  id?: string
  imageSrc?: string
  showChangeButton?: boolean
  size?: number
  sx?: SxProps<Theme>
  onChange?: () => void
}

const Avatar = ({ className, id, imageSrc, showChangeButton, size, sx, onChange }: Props) => {
  if (!size) {
    size = 80
  }

  return (
    <Box
      className={`${styles.avatarBlock} ${className}`}
      id={id}
      sx={{ width: `${size}px`, height: `${size}px`, ...sx }}
    >
      <img src={imageSrc} crossOrigin="anonymous" />
      {showChangeButton && (
        <IconButton
          className={styles.avatarBtn}
          disableRipple
          icon={<CreateIcon sx={{ fontSize: '20px' }} />}
          onClick={onChange}
        />
      )}
    </Box>
  )
}

export default Avatar
