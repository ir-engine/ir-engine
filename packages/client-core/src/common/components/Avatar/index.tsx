import React from 'react'

import IconButton from '@xrengine/client-core/src/common/components/IconButton'
import Text from '@xrengine/client-core/src/common/components/Text'

import CreateIcon from '@mui/icons-material/Create'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import { SxProps, Theme } from '@mui/material/styles'

import { handleSoundEffect } from '../../utils'
import styles from './index.module.scss'

interface Props {
  alt?: string
  className?: string
  id?: string
  imageSrc?: string
  isSelected?: boolean
  name?: string
  showChangeButton?: boolean
  size?: number
  sx?: SxProps<Theme>
  type?: 'round' | 'square'
  onChange?: () => void
}

const Avatar = ({
  alt,
  className,
  id,
  imageSrc,
  isSelected,
  name,
  showChangeButton,
  size,
  sx,
  type,
  onChange
}: Props) => {
  if (!size) {
    size = 80
  }

  if (type === 'square') {
    return (
      <Paper
        title={name}
        className={`${styles.avatarSquare} ${isSelected ? styles.avatarSelected : ''}`}
        sx={{
          boxShadow: 'none',
          backgroundColor: (theme) => (theme.palette.mode === 'dark' ? '#1A2027' : '#f1f1f1'),
          pointerEvents: isSelected ? 'none' : 'auto'
        }}
        onClick={onChange}
        onPointerUp={handleSoundEffect}
        onPointerEnter={handleSoundEffect}
      >
        <img className={styles.avatar} src={imageSrc} alt={alt} crossOrigin="anonymous" />
        {name && (
          <Text variant="body2" className={styles.avatarName}>
            {name}
          </Text>
        )}
      </Paper>
    )
  }

  return (
    <Box
      className={`${styles.avatarBlock} ${className}`}
      id={id}
      sx={{ width: `${size}px`, height: `${size}px`, ...sx }}
    >
      <img alt={alt} src={imageSrc} crossOrigin="anonymous" />
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
