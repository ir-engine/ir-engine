/*
CPAL-1.0 License
The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.
Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.
The Original Code is Ethereal Engine.
The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.
All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React, { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { JSONTree } from 'react-json-tree'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import styles from './styles.module.scss'

const labelRenderer = (data: Record<string | number, any>) => {
  return (keyPath: (string | number)[]) => {
    const key = keyPath[0]
    if (keyPath.length === 2 && typeof key === 'number') {
      return <strong>{Array.isArray(data[key].type) ? data[key].type[0] : data[key].type}</strong>
    }
    return <strong>{key}</strong>
  }
}

function ActionsPanel() {
  const { t } = useTranslation()

  useHookstate(getMutableState(EngineState)).simulationTime.value // re-render the actions data with each simulationTime change

  return (
    <>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.actionsHistory')}</h1>
        <JSONTree
          data={Engine.instance.store.actions.history}
          labelRenderer={labelRenderer(Engine.instance.store.actions.history)}
          shouldExpandNodeInitially={() => false}
        />
      </div>
      <div className={styles.jsonPanel}>
        <h1>{t('common:debug.actionsCached')}</h1>
        <JSONTree
          data={Engine.instance.store.actions.cached}
          labelRenderer={labelRenderer(Engine.instance.store.actions.cached)}
          shouldExpandNodeInitially={() => false}
        />
      </div>
    </>
  )
}

export default memo(ActionsPanel)
