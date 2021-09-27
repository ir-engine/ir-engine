import Typography from '@material-ui/core/Typography'
import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Registration.module.scss'
import { useTranslation } from 'react-i18next'

const Registration = (props: any): any => {
  const { t } = useTranslation()

  return (
    <div className={styles.menuPanel}>
      <section className={styles.profilePanel}>
        <div className={styles.logo}>
          <span>Log in to</span>
          <img src="/assets/LogoColored.png" alt="logo" crossOrigin="anonymous" className="logo" />
        </div>
        <section className={styles.socialBlock}>
          <div className={styles.socialContainer}>
            <div className={styles.socialWrap} id="registration">
              <Link to="/registration/stepOne">
                <Typography variant="h3" className={styles.textBlock}>
                  Registration
                </Typography>
              </Link>
            </div>

            <div className={styles.socialWrap} id="authorization">
              <Typography variant="h3" className={styles.textBlock}>
                Authorization
              </Typography>
            </div>
          </div>
          <Typography variant="h4" className={styles.smallTextBlock}>
            {t('user:usermenu.profile.createOne')}
          </Typography>
        </section>
      </section>
    </div>
  )
}

export default Registration
