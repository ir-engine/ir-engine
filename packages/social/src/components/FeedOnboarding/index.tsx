import React, { useState, useEffect } from 'react'
import styles from './FeedOnboarding.module.scss'
import { isIOS } from '@xrengine/client-core/src/util/platformCheck'

interface Props {
  setFeedOnborded?: any
}

const FeedOnboarding = (props: Props) => {
  const [screen, setScreen] = useState(1)
  const [visibility, changeVisibility] = useState(false)
  const { setFeedOnborded } = props

  useEffect(() => {
    setTimeout(() => {
      changeVisibility(true)
    }, 1000)
  }, [])

  const closeFeedOnboarding = () => {
    changeVisibility(false)
    setTimeout(() => {
      setFeedOnborded(true)
    }, 1000)
  }
  const platformClass = isIOS ? styles.isIos : ''

  switch (screen) {
    case 1:
      return (
        <div
          className={
            !visibility
              ? styles.firstScreen + ' ' + styles.onboarding + ' ' + styles.unvisibile
              : styles.firstScreen + ' ' + styles.onboarding
          }
        >
          <button
            type="button"
            onClick={() => {
              closeFeedOnboarding()
            }}
            className={styles.skip + ' ' + platformClass}
          >
            Skip
          </button>
          <div className={styles.relativeImage}>
            <img src="/assets/feedOnboarding/plus.png" className={styles.mobImage} />
            <ul className={styles.loadingFrame}>
              <div className={styles.circle} />
              <div className={styles.circle} />
              <div className={styles.circle} />
              <div className={styles.circle} />
              <div className={styles.circle} />
              <div className={styles.circle} />
              <div className={styles.circle} />
              <div className={styles.circle} />
              <div className={styles.circle} />
              <div className={styles.circle} />
            </ul>
            <p className={styles.offsetImg}>Click to create the new feed.</p>
            <button
              type="button"
              onClick={() => {
                setScreen(2)
              }}
            >
              {' '}
              Next{' '}
            </button>
          </div>
        </div>
      )

    case 2:
      return (
        <div
          className={
            !visibility
              ? styles.firstScreen + ' ' + styles.onboarding + ' ' + styles.unvisibile
              : styles.secondScreen + ' ' + styles.onboarding
          }
        >
          <div className={styles.relativeImage}>
            <img src="/assets/feedOnboarding/clip.png" className={styles.mobImage} />
            <div className={styles.relativePointer}>
              <ul className={styles.loadingFrame}>
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
              </ul>
              <p className={styles.offsetImg}>Select the clip.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setScreen(3)
            }}
          >
            {' '}
            Next{' '}
          </button>
          <button
            type="button"
            onClick={() => {
              closeFeedOnboarding()
            }}
            className={styles.skip + ' ' + platformClass}
          >
            Skip
          </button>
        </div>
      )

    case 3:
      return (
        <div
          className={
            !visibility
              ? styles.firstScreen + ' ' + styles.onboarding + ' ' + styles.unvisibile
              : styles.thirdScreen + ' ' + styles.onboarding
          }
        >
          <div className={styles.relativeImage}>
            <img src="/assets/feedOnboarding/camera.png" className={styles.mobImage} />
            <div className={styles.relativePointer}>
              <ul className={styles.loadingFrame}>
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
                <div className={styles.circle} />
              </ul>
              <p className={styles.offsetImg}>Tab to set the figure on screen.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              closeFeedOnboarding()
            }}
          >
            {' '}
            Get Started !{' '}
          </button>
          <button
            type="button"
            onClick={() => {
              closeFeedOnboarding()
            }}
            className={styles.skip + ' ' + platformClass}
          >
            Skip
          </button>
        </div>
      )
  }
}

export default FeedOnboarding
