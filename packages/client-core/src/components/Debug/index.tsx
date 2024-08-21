/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { AvatarComponent } from '@ir-engine/engine/src/avatar/components/AvatarComponent'
import { respawnAvatar } from '@ir-engine/engine/src/avatar/functions/respawnAvatar'
import {
  defineState,
  getMutableState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'

import { EntityDebug } from './EntityDebug'
import { StateDebug } from './StateDebug'
import { StatsPanel } from './StatsPanel'
import { SystemDebug } from './SystemDebug'
import styles from './styles.module.scss'

export const DebugState = defineState({
  name: 'DebugState',
  initial: {
    enabled: false,
    activeTab: 'None'
  },
  extension: syncStateWithLocalStorage(['enabled', 'activeTab'])
})

export const DebugTabs = {
  Entities: EntityDebug,
  Systems: SystemDebug,
  State: StateDebug
}

export const Debug = () => {
  useHookstate(getMutableState(ECSState).frameTime).value
  const rendererState = useMutableState(RendererState)
  const activeTab = useMutableState(DebugState).activeTab

  const { t } = useTranslation()

  const onClickRespawn = (): void => {
    respawnAvatar(AvatarComponent.getSelfAvatarEntity())
  }

  const toggleDebug = () => {
    rendererState.physicsDebug.set(!rendererState.physicsDebug.value)
  }

  const toggleAvatarDebug = () => {
    rendererState.avatarDebug.set(!rendererState.avatarDebug.value)
  }

  const toggleNodeHelpers = () => {
    getMutableState(RendererState).nodeHelperVisibility.set(!getMutableState(RendererState).nodeHelperVisibility.value)
  }

  const toggleGridHelper = () => {
    getMutableState(RendererState).gridVisibility.set(!getMutableState(RendererState).gridVisibility.value)
  }

  const ActiveTabComponent = DebugTabs[activeTab.value]

  return (
    <div className={styles.debugContainer} style={{ pointerEvents: 'all' }}>
      <div className={styles.debugOptionContainer}>
        <h1>{t('common:debug.debugOptions')}</h1>
        <div className={styles.optionBlock}>
          <div className={styles.flagContainer}>
            <button
              type="button"
              onClick={toggleDebug}
              className={styles.flagBtn + (rendererState.physicsDebug.value ? ' ' + styles.active : '')}
              title={t('common:debug.debug')}
            >
              <Icon type="SquareFoot" fontSize="small" />
            </button>
            <button
              type="button"
              onClick={() => rendererState.bvhDebug.set(!rendererState.bvhDebug.value)}
              className={styles.flagBtn + (rendererState.bvhDebug.value ? ' ' + styles.active : '')}
              title={t('common:debug.debug')}
            >
              <Icon type="AllOutIcon" fontSize="small" />
            </button>
            <button
              type="button"
              onClick={toggleAvatarDebug}
              className={styles.flagBtn + (rendererState.avatarDebug.value ? ' ' + styles.active : '')}
              title={t('common:debug.debug')}
            >
              <Icon type="Person" fontSize="small" />
            </button>
            <button
              type="button"
              onClick={toggleNodeHelpers}
              className={styles.flagBtn + (rendererState.nodeHelperVisibility.value ? ' ' + styles.active : '')}
              title={t('common:debug.nodeHelperDebug')}
            >
              <Icon type="SelectAll" fontSize="small" />
            </button>
            <button
              type="button"
              onClick={toggleGridHelper}
              className={styles.flagBtn + (rendererState.gridVisibility.value ? ' ' + styles.active : '')}
              title={t('common:debug.gridDebug')}
            >
              <Icon type="GridOn" fontSize="small" />
            </button>
            <button
              type="button"
              onClick={() => rendererState.forceBasicMaterials.set(!rendererState.forceBasicMaterials.value)}
              className={styles.flagBtn + (rendererState.forceBasicMaterials.value ? ' ' + styles.active : '')}
              title={t('common:debug.forceBasicMaterials')}
            >
              <Icon type="FormatColorReset" fontSize="small" />
            </button>
            <button type="button" className={styles.flagBtn} id="respawn" onClick={onClickRespawn}>
              <Icon type="Refresh" />
            </button>
          </div>
        </div>
      </div>
      <StatsPanel show />
      <div className={styles.jsonPanel}>
        {['None']
          .concat(Object.keys(DebugTabs))
          .concat('All')
          .map((tab, i) => (
            <button
              key={i}
              onClick={() => activeTab.set(tab)}
              className={styles.flagBtn + (activeTab.value === tab ? ' ' + styles.active : '')}
              style={{ width: '100px' }}
            >
              {tab}
            </button>
          ))}
      </div>
      {activeTab.value === 'All' ? (
        <>
          {Object.values(DebugTabs).map((Tab, i) => (
            <Tab key={i} />
          ))}
        </>
      ) : (
        ActiveTabComponent && <ActiveTabComponent />
      )}
    </div>
  )
}

export const DebugToggle = () => {
  const isShowing = useHookstate(getMutableState(DebugState).enabled)

  useEffect(() => {
    function downHandler({ keyCode }) {
      if (keyCode === 192) {
        isShowing.set(!isShowing.value)
      }
    }
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [])

  return isShowing.value ? <Debug /> : <></>
}

export default DebugToggle
