import React from 'react'

import AppFooter from '@xrengine/social/src/components/Footer'
import Feed from '@xrengine/social/src/components/Feed'

import { useLocation } from 'react-router-dom'
import AppHeader from '@xrengine/social/src/components/Header'

// @ts-ignore
import styles from './index.module.scss'

export default function FeedPage() {
  const feedId = new URLSearchParams(useLocation().search).get('feedId').toString()
  return (
    <div className={styles.viewport}>
      <AppHeader />
      <Feed feedId={feedId} />
      <AppFooter />
    </div>
  )
}
