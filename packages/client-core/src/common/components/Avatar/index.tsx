import React from 'react'
import { useTranslation } from 'react-i18next'

import commonStyles from '@etherealengine/client-core/src/common/components/common.module.scss'
import Text from '@etherealengine/client-core/src/common/components/Text'
import Box from '@etherealengine/ui/src/Box'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import Paper from '@etherealengine/ui/src/Paper'

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
  type?: 'round' | 'rectangle' | 'thumbnail'
  onChange?: () => void
  onClick?: () => void
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
  onChange,
  onClick
}: Props) => {
  const { t } = useTranslation()

  if (!size) {
    size = 80
  }

  const handleChange = (e) => {
    e.stopPropagation()
    onChange && onChange()
  }

  if (type === 'rectangle') {
    return (
      <Paper
        title={name}
        className={`${styles.avatarRectangle} ${isSelected ? styles.avatarSelected : ''}`}
        onClick={onClick}
        onPointerUp={handleSoundEffect}
        onPointerEnter={handleSoundEffect}
      >
        <img className={styles.avatar} src={imageSrc} alt={alt} crossOrigin="anonymous" />
        <Text variant="body2" flex={1} className={styles.avatarName}>
          {name}
        </Text>

        {showChangeButton && (
          <IconButton
            icon={<Icon type="Create" sx={{ fontSize: '20px' }} />}
            title={t('user:common.edit')}
            onClick={handleChange}
          />
        )}
      </Paper>
    )
  } else if (type === 'thumbnail') {
    return (
      <Box
        className={`${commonStyles.preview} ${styles.avatarThumbnail} ${className}`}
        sx={{ width: `${size}px`, height: `${size}px`, ...sx }}
      >
        <img alt={alt} src={imageSrc} crossOrigin="anonymous" />
        {!imageSrc && (
          <Text className={commonStyles.previewText} variant="body2">
            {t('admin:components.avatar.thumbnailPreview')}
          </Text>
        )}
      </Box>
    )
  }

  return (
    <Box
      className={`${styles.avatarRound} ${className}`}
      id={id}
      sx={{ width: `${size}px`, height: `${size}px`, ...sx }}
    >
      <img alt={alt} src={imageSrc} crossOrigin="anonymous" />
      {showChangeButton && (
        <IconButton
          disableRipple
          icon={<Icon type="Create" sx={{ fontSize: '20px' }} />}
          type="glow"
          onClick={onChange}
        />
      )}
    </Box>
  )
}

export default Avatar
