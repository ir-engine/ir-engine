import React from 'react'

import AppFooter from '@xrengine/client-core/src/socialmedia/components/Footer'
import Feed from '@xrengine/client-core/src/socialmedia/components/Feed'

import { useLocation } from 'react-router-dom'
import AppHeader from '@xrengine/client-core/src/socialmedia/components/Header'

import styles from './index.module.scss'

export default function FeedPage() {
  const feedId = new URLSearchParams(useLocation().search).get('feedId').toString()
  return (
    <div className={styles.viewport}>
      <AppHeader logo="/assets/logoBlack.png" />
      <Feed feedId={feedId} />
      <AppFooter />
    </div>
  )
}
