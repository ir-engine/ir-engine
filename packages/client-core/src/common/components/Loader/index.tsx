import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { GeneralStateList } from '../../reducers/app/actions'
import { selectAppOnBoardingStep } from '../../reducers/app/selector'
// import { selectCurrentScene } from '../../../world/reducers/scenes/selector'
import { useSceneState } from '../../../world/store/SceneState'

import { useTranslation } from 'react-i18next'
import styles from './Loader.module.scss'
interface Props {
  objectsToLoad?: number
  onBoardingStep?: number
  Loader?: any
}

const mapStateToProps = (state: any): any => {
  return {
    onBoardingStep: selectAppOnBoardingStep(state)
  }
}

const LoadingScreen = (props: Props) => {
  const { onBoardingStep, objectsToLoad, Loader } = props
  const [showProgressBar, setShowProgressBar] = useState(true)
  const [loadingText, setLoadingText] = useState('')
  const { t } = useTranslation()
  const currentSceneState = useSceneState()

  useEffect(() => {
    switch (onBoardingStep) {
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
  }, [onBoardingStep])

  useEffect(() => {
    if (onBoardingStep === GeneralStateList.SCENE_LOADING) {
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
      <section
        className={styles.overlay}
        style={{ backgroundImage: `url(${currentSceneState.currentScene?.thumbnailUrl.get()})` }}
      >
        <section className={styles.linearProgressContainer}>
          {Loader && <Loader />}
          <span className={styles.loadingProgressInfo}>{loadingText}</span>
        </section>
      </section>
    </>
  )
}
export default connect(mapStateToProps)(LoadingScreen)
