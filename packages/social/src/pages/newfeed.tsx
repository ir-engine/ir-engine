import React from 'react'

import AppFooter from '@xrengine/social/src/components/Footer'
import FeedForm from '@xrengine/social/src/components/FeedForm'
import AppHeader from '@xrengine/social/src/components/Header'

import styles from './index.module.scss'

export default function NewFeedPage() {
  return (
    <div className={styles.viewport}>
      <AppHeader title={'CREATOR'} />
      <FeedForm />
      <AppFooter />
    </div>
  )
}
