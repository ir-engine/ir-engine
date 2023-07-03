/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'

import commonStyles from '@etherealengine/client-core/src/common/components/common.module.scss'
import Text from '@etherealengine/client-core/src/common/components/Text'
import Box from '@etherealengine/ui/src/primitives/mui/Box'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'
import IconButton from '@etherealengine/ui/src/primitives/mui/IconButton'
import Paper from '@etherealengine/ui/src/primitives/mui/Paper'

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
          sx={{
            position: 'absolute',
            width: '30px',
            height: '30px',
            bottom: '-10px',
            right: '-10px',
            margin: '0',
            minWidth: '30px',
            borderRadius: '50%',
            background: 'var(--iconButtonBackground)',
            boxShadow: '2px 2px 10px gray',
            transition: 'all .15s cubic-bezier(.18,.89,.32,1.28)'
          }}
        />
      )}
    </Box>
  )
}

export default Avatar
