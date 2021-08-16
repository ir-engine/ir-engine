import React from 'react'

import AppFooter from '@xrengine/client-core/src/socialmedia/components/Footer'
import NotificationList from '@xrengine/client-core/src/socialmedia/components/NotificationList'
import AppHeader from '@xrengine/client-core/src/socialmedia/components/Header'

import styles from './index.module.scss'

export default function NotificationsPage() {
  return (
    <div className={styles.viewport}>
      <AppHeader logo="/assets/logoBlack.png" />
      <NotificationList />
      <AppFooter />
    </div>
  )
}
