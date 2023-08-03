import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import styles from './styles.module.scss'

function ActionsPanel() {
  const { t } = useTranslation()

  useHookstate(getMutableState(EngineState)).simulationTime.value

  return (
    <>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.actionsHistory')}</h1>
        <JSONTree data={Engine.instance.store.actions.history} shouldExpandNodeInitially={() => false} />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.actionsCached')}</h1>
        <JSONTree data={Engine.instance.store.actions.cached} shouldExpandNodeInitially={() => false} />
      </div>
    </>
  )
}

export default memo(ActionsPanel)
