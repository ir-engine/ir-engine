/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Typography from '@material-ui/core/Typography'
import React, { useEffect } from 'react'
import { useDispatch } from '@standardcreative/client-core/src/store'

import { useCreatorState } from '@standardcreative/client-core/src/social/state/CreatorState'
import { CreatorService } from '@standardcreative/client-core/src/social/state/CreatorService'
import NotificationCard from '../NotificationCard'
import { useTranslation } from 'react-i18next'

import styles from './NotificationList.module.scss'

interface Props {
  creatorsState?: any
}
const NotificationList = ({ creatorsState }: Props) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()

  useEffect(() => {
    CreatorService.getCreatorNotificationList()
  }, [])
  const notificationList = creatorsState && creatorsState.creators ? creatorsState.currentCreatorNotifications : null
  return (
    <section className={styles.notificationsContainer}>
      <Typography variant="h2">{t('social:notification.activity')}</Typography>
      {notificationList && notificationList.map((item, key) => <NotificationCard key={key} notification={item} />)}
    </section>
  )
}

export default NotificationList
