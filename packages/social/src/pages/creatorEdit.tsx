import React from 'react'
import CreatorForm from '@xrengine/social/src/components/CreatorForm'
import AppFooter from '@xrengine/social/src/components/Footer'

import styles from './index.module.scss'

export default function User() {
  return (
    <>
      <div className={styles.viewport}>
        <CreatorForm />
        <AppFooter />
      </div>
    </>
  )
}
