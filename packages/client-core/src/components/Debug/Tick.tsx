import React from 'react'
import { useTranslation } from 'react-i18next'

import { useEngineState } from '@xrengine/engine/src/ecs/classes/EngineService'

import styles from './styles.module.scss'

export const Tick = () => {
  const engineState = useEngineState()
  const { t } = useTranslation()

  return (
    <div className={styles.tickBlock}>
      {t('common:debug.tick')}
      <span>{engineState.fixedTick.value}</span>
    </div>
  )
}
