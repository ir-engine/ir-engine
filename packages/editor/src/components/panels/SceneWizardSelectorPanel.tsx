import React from 'react'
import * as styles from '../styles.module.scss'

export const SceneWizardSelectorPanel = ({ onNewScene, wizardInstalled }) => {
  console.log(wizardInstalled)
  return (
    <div className={styles.wizardContainer}>
      <h2>Scene Wizard</h2>
      <div>
        <div>
          <button onClick={() => onNewScene()}>Empty Scene</button>
        </div>
        <div>
          <button
            className={wizardInstalled ? styles.wizardButtonEnabled : styles.wizardButtonDisabled}
            disabled={!wizardInstalled}
          >
            Start Wizard
          </button>
        </div>
      </div>
    </div>
  )
}
