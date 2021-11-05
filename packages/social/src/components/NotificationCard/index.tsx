/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
import { useHistory } from 'react-router-dom'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import styles from './NotificationCard.module.scss'
import { useTranslation } from 'react-i18next'

const NotificationCard = ({ notification }: any) => {
  const history = useHistory()
  const { t } = useTranslation()
  const checkNotificationAction = (type) => {
    switch (type) {
      case 'feed-fire':
        return t('social:notification.feedFire')
      case 'feed-bookmark':
        return t('social:notification.feedBookmarked')
      case 'comment':
        return t('social:notification.comment')
      case 'comment-fire':
        return t('social:notification.commentFire')
      case 'follow':
        return t('social:notification.follow')
      case 'unfollow':
        return t('social:notification.unfollow')
      default:
        return t('social:notification.followed')
    }
  }
  return (
    <Card className={styles.commentItem} square={false} elevation={0} key={notification.id}>
      <Avatar
        onClick={() => history.push('/creator?creatorId=' + notification.creatorAuthorId)}
        className={styles.authorAvatar}
        src={notification.avatar}
      />
      <CardContent className={styles.commentCard}>
        <Typography variant="h2">
          {notification.creator_username}
          {checkNotificationAction(notification.type)}
          {notification.comment_text && ' "' + notification.comment_text + '"'}
        </Typography>
      </CardContent>
      {notification.type !== 'follow' && notification.type !== 'unfollow' && (
        <section className={styles.fire}>
          <Avatar
            variant="rounded"
            onClick={() => history.push('/feed?feedId=' + notification.feedId)}
            className={styles.authorAvatar}
            src={notification.previewUrl}
          />
        </section>
      )}
    </Card>
  )
}

export default NotificationCard
