import React from 'react'

import AppFooter from '@xrengine/client-core/src/socialmedia/components/Footer'
import NotificationList from '@xrengine/client-core/src/socialmedia/components/NotificationList'

import styles from './index.module.scss'

export default function NotificationsPage() {
  return (
    <div className={styles.viewport}>
      <NotificationList />
      <AppFooter />
    </div>
  )
}
