/**
 * @author Yevhenyi Petrenko <evhenyipetrenko@gmail.com>
 */
import React from 'react'
// @ts-ignore
import styles from './Blocked.module.scss'

const Blocked = () => {
  return (
    <div className={styles.wrap}>
      <div className={styles.container}>
        <p>You have been temporarily blocked pending further review</p>
        <p>Please contact support with any questions</p>
        <hr />
        <div className={styles.mail}>
          <a href="mailto:info@arcmedia.us">info@arcmedia.us</a>
        </div>
      </div>
    </div>
  )
}

export default Blocked
