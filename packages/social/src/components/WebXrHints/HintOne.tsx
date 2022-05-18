import React from 'react'
import styles from './WebXRHints.module.scss'

interface Props {
  hintOneShow?: any
}

const HintOne = ({ hintOneShow }: Props) => {
  return (
    <div className={styles.hintOne}>
      <div className={styles.thirdScreen + ' ' + styles.onboarding}>
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
            <p className={styles.offsetImg}>Tap the screen to lock me in place.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            hintOneShow(false)
          }}
        >
          {' '}
          Got it!{' '}
        </button>
      </div>
    </div>
  )
}

export default HintOne
