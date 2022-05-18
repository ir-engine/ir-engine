import React from 'react'
import Avatar from '@mui/material/Avatar'
import { useTranslation } from 'react-i18next'

import styles from './Stories.module.scss'

export const StoryItem = ({ data }: any) => {
  const size = 56
  const { t } = useTranslation()
  return (
    <div className={styles.storyItem}>
      <div className="story-photo-container">
        <Avatar
          alt={t('social:story.profilePic', { user: data?.username })}
          data-testid="user-avatar"
          draggable="false"
          src={data?.image}
          style={{
            width: size,
            height: size,
            borderRadius: size,
            border: '2px solid white',
            cursor: 'pointer'
          }}
        />
      </div>
    </div>
  )
}
