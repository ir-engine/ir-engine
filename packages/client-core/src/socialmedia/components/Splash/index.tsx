/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
// @ts-ignore
import styles from './Splash.module.scss'

const Splash = () => {
  return (
    <div className={styles.splash}>
      <img className={styles.logo} src="/assets/splash/ARC_Splash.png" />
    </div>
  )
}

export default Splash
