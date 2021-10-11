import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import Loader from './Block'
import { useTranslation } from 'react-i18next'
import styles from './Loader.module.scss'
import { GeneralStateList } from '@xrengine/client-core/src/common/reducers/app/AppActions'
import { useAppState } from '@xrengine/client-core/src/common/reducers/app/AppState'
import { useSceneState } from '@xrengine/client-core/src/world/reducers/scenes/SceneState'
interface Props {
  objectsToLoad?: number
}

const LoadingScreen = (props: Props) => {
  const { objectsToLoad } = props
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
    <div>
      <section className={styles.blockbg}>
        <div className={styles.block}>
          <Loader />
          <h4 className={styles.title}>{loadingText}</h4>
        </div>

        <div className={styles.poweredByMappa}>
          <span>powered by:</span>
          <h4>MAPPA</h4>
        </div>
      </section>
    </div>
  )
}
export default LoadingScreen
