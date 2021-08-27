import CreatorForm from '@xrengine/client-core/src/socialmedia/components/CreatorForm'
import React from 'react'
import styles from './index.module.scss'

export default function User() {
  return (
    <>
      <div className={styles.viewport}>
        <CreatorForm />
      </div>
    </>
  )
}
