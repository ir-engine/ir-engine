import React from 'react'

import styles from './index.module.scss'

const Loader = (): JSX.Element => {
  return (
    <div className={styles['wrapper']}>
      <div className={styles['box']}>
        <div className={styles['cube']} />
        <div className={styles['cube']} />
        <div className={styles['cube']} />
        <div className={styles['cube']} />
      </div>
    </div>
  )
}

export default Loader
