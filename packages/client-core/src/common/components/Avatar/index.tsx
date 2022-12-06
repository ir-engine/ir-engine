import React from 'react'

import IconButton from '@xrengine/client-core/src/common/components/IconButton'

import CreateIcon from '@mui/icons-material/Create'
import Box from '@mui/material/Box'
import { SxProps, Theme } from '@mui/material/styles'

import styles from './index.module.scss'

interface Props {
  className?: string
  imageSrc?: string
  showChangeButton?: boolean
  sx?: SxProps<Theme>
  onClick?: () => void
}

const Avatar = ({ className, imageSrc, showChangeButton, sx, onClick }: Props) => {
  return (
    <Box className={`${styles.avatarBlock} ${className}`} sx={sx}>
      <img src={imageSrc} crossOrigin="anonymous" />
      {showChangeButton && (
        <IconButton
          className={styles.avatarBtn}
          disableRipple
          icon={<CreateIcon sx={{ fontSize: '20px' }} />}
          onClick={onClick}
        />
      )}
    </Box>
  )
}

export default Avatar
