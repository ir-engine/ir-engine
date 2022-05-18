import React from 'react'

import AppFooter from '@xrengine/social/src/components/Footer'
import NotificationList from '@xrengine/social/src/components/NotificationList'
import AppHeader from '@xrengine/social/src/components/Header'

// @ts-ignore
import styles from './index.module.scss'

export default function NotificationsPage() {
  return (
    <div className={styles.viewport}>
      <AppHeader />
      <NotificationList />
      <AppFooter />
    </div>
  )
}
