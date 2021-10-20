import React from 'react'

import AppFooter from '@standardcreative/social/src/components/Footer'
import NotificationList from '@standardcreative/social/src/components/NotificationList'

import styles from './index.module.scss'

export default function NotificationsPage() {
  return (
    <div className={styles.viewport}>
      <NotificationList />
      <AppFooter />
    </div>
  )
}
