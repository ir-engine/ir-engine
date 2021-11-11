import React, { useEffect, useState } from 'react'
import { GeneralStateList } from '../../services/AppService'
import { useAppState } from '../../services/AppService'
import { useTranslation } from 'react-i18next'
import styles from './Loader.module.scss'
import LottieLoader from './LottieLoader'
import { useEngineState } from '../../../world/services/EngineService'

interface Props {
  Loader?: any
}

const LoadingScreen = (props: Props) => {
  const { Loader } = props
  const onBoardingStep = useAppState().onBoardingStep
  const [showProgressBar, setShowProgressBar] = useState(true)
  const [loadingText, setLoadingText] = useState('')
  const { t } = useTranslation()
  const objectsToLoad = useEngineState().loadingProgress.value

  useEffect(() => {
    switch (onBoardingStep.value) {
      case GeneralStateList.START_STATE:
        setLoadingText(t('common:loader.connecting'))
        setShowProgressBar(true)
        break
      case GeneralStateList.SCENE_LOADED:
        setLoadingText(t('common:loader.entering'))
        break
      case GeneralStateList.AWAITING_INPUT:
        setLoadingText('Click to join')
        break
      case GeneralStateList.SUCCESS:
        setShowProgressBar(false)
        break
      default:
        setLoadingText(t('common:loader.loading'))
        break
    }
  }, [onBoardingStep.value])

  useEffect(() => {
    if (onBoardingStep.value === GeneralStateList.SCENE_LOADING) {
      setLoadingText(
        t('common:loader.' + (objectsToLoad > 1 ? 'objectRemainingPlural' : 'objectRemaining'), {
          count: objectsToLoad
        })
      )
    }
  }, [objectsToLoad])

  if (!showProgressBar) return null

  return (
    <>
      <section className={styles.overlay}>
        <div className={styles.imageOverlay}></div>
        {Loader ? <Loader /> : <LottieLoader />}
        <section className={styles.linearProgressContainer}>
          <span className={styles.loadingProgressInfo}>{loadingText}</span>
        </section>
      </section>
    </>
  )
}
export default LoadingScreen
