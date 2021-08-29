/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Splash.module.scss'
interface Props {
  media?: {
    screen?: string
    logo?: string
  }
}

const Splash = ({ media }: Props) => {
  const { t } = useTranslation()

  return (
    <div className={styles.splash}>
      <img className={styles.logo} src="/assets/splash/ARC_Splash.png" />
    </div>
  )
}

export default Splash
