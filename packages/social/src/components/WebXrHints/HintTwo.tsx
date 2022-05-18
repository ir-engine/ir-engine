import React from 'react'
import styles from './WebXRHints.module.scss'

interface Props {
  hintTwoShow?: any
}

const HintTwo = ({ hintTwoShow }: Props) => {
  return (
    <div className={`${styles.hintOne}` + ' ' + `${styles.hintTwo}`}>
      <div className={styles.thirdScreen + ' ' + styles.onboarding}>
        <div className={styles.relativeImage}>
          <div className={styles.relativePointer}>
            <ul className={styles.loadingFrame + ' ' + styles.hintButtonTwo}>
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
            <p className={styles.offsetImg}>Hit record to start the performance.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            hintTwoShow(false)
          }}
        >
          {' '}
          Got it!{' '}
        </button>
      </div>
    </div>
  )
}

export default HintTwo
