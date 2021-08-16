/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import CardMedia from '@material-ui/core/CardMedia'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Splash.module.scss'

interface MediaRecord {
  screen: string
  logo: string
}
interface Props {
  media: MediaRecord
}

const Splash = ({ media }: Props) => {
  const { t } = useTranslation()

  return (
    <div className={styles.splash}>
      {/*<CardMedia*/}
      {/*    className={styles.fullPage}*/}
      {/*        image="/assets/splash/background.jpg"*/}
      {/*        title={t('social:splash.screen')}*/}
      {/*    />*/}
      <img className={styles.logo} src="/assets/splash/ARC_Splash.png" />
      {/*<CardMedia*/}
      {/*    className={styles.logo}*/}
      {/*        image="/assets/splash/ARC_Splash.png"*/}
      {/*        title={t('social:splash.logo')}*/}
      {/*    />*/}
    </div>
  )
}

export default Splash
