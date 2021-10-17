import React, { useEffect, useState } from 'react'
import { GeneralStateList } from '../../state/AppActions'
import { useAppState } from '../../state/AppState'
import { useTranslation } from 'react-i18next'
import styles from './Loader.module.scss'
import LottieLoader from './LottieLoader'

interface Props {
  objectsToLoad?: number

  Loader?: any
}

const LoadingScreen = (props: Props) => {
  const { objectsToLoad, Loader } = props
  const onBoardingStep = useAppState().onBoardingStep
  const [showProgressBar, setShowProgressBar] = useState(true)
  const [loadingText, setLoadingText] = useState('')
  const { t } = useTranslation()

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
