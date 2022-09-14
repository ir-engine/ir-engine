import { useState } from '@hookstate/core'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { EngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { getState } from '@xrengine/hyperflux'

import styles from './index.module.scss'

export const ConnectingToWorldServerModal = () => {
  const { t } = useTranslation()
  const engineState = useState(getState(EngineState))

  if (engineState.connectedWorld.value) return <></>

  return (
    <div className={styles.modalConnecting}>
      <div className={styles.modalConnectingTitle}>
        <p>{t('common:loader.connecting')}</p>
      </div>
    </div>
  )
}
