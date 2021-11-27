/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import Button from '@material-ui/core/Button'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import { useHistory } from 'react-router-dom'
import React, { useState } from 'react'
import styles from './OnBoarding.module.scss'
import { useTranslation } from 'react-i18next'

interface MediaRecord {
  screenBg: string
  images: string[]
}
interface Props {
  media: MediaRecord[]
}

const OnBoardingComponent = ({ media }: Props) => {
  const [step, setStep] = useState(0)
  const history = useHistory()
  const { t } = useTranslation()
  let content = null
  switch (step) {
    case 0:
      content = (
        <section className={styles.step_0}>
          <Typography color="secondary" variant="h1" align="center">
            {t('social:onBoarding.welcome')}
          </Typography>
          <Typography color="secondary" variant="h2">
            {t('social:onBoarding.description')}
          </Typography>
          <Button variant="contained" color="primary" fullWidth onClick={() => setStep(step + 1)}>
            {t('social:onBoarding.next')}
          </Button>
        </section>
      )
      break
    case 1:
      content = (
        <section className={styles.step_1}>
          <span className={styles.placeholder} />
          <CardMedia
            className={styles.image}
            image={media[step].images[0]}
            title={t('social:onBoarding.discover') + ' ' + t('social:onBoarding.news')}
          />
          <Typography variant="h1" align="center">
            {t('social:onBoarding.discover')}
            <br />
            {t('social:onBoarding.news')}
          </Typography>
          <Typography variant="h2" align="center">
            {t('social:onBoarding.lines')}
          </Typography>
          <span className={styles.placeholder} />
          <Button variant="contained" color="primary" onClick={() => setStep(step + 1)}>
            {t('social:onBoarding.getStarted')}
          </Button>
        </section>
      )
      break
    default:
      content = (
        <section className={styles.step_2}>
          <Button variant="contained" color="primary" onClick={() => history.push('/login')}>
            {t('social:onBoarding.next')}
          </Button>
          <span className={styles.placeholder} />
          <Typography variant="h1" align="center">
            {t('social:onBoarding.meetUp')}
            <br />
            {t('social:onBoarding.friends')}
          </Typography>
          <Typography variant="h2" align="center">
            {t('social:onBoarding.lines')}
          </Typography>
          <span className={styles.placeholder} />
          <CardMedia className={styles.image} image={media[step].images[0]} title={t('social:onBoarding.meet')} />
        </section>
      )
  }

  return (
    <section className={styles.fullPage} style={{ backgroundImage: `url(${media[step].screenBg})` }}>
      <section className={styles.subWrapper}>{content}</section>
    </section>
  )
}

export default OnBoardingComponent
