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

import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AvatarControllerComponent } from '@etherealengine/engine/src/avatar/components/AvatarControllerComponent'
import { respawnAvatar } from '@etherealengine/engine/src/avatar/functions/respawnAvatar'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineState } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { RendererState } from '@etherealengine/engine/src/renderer/RendererState'
import { defineState, getMutableState, syncStateWithLocalStorage, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import { EntityDebug } from './EntityDebug'
import { StateDebug } from './StateDebug'
import { StatsPanel } from './StatsPanel'
import { SystemDebug } from './SystemDebug'
import styles from './styles.module.scss'

export const DebugState = defineState({
  name: 'DebugState',
  initial: {
    activeTab: 'None'
  },
  onCreate: (store, state) => {
    syncStateWithLocalStorage(DebugState, ['activeTab'])
  }
})

export const DebugTabs = {
  Entities: EntityDebug,
  Systems: SystemDebug,
  State: StateDebug
}

export const Debug = ({ showingStateRef }: { showingStateRef: React.MutableRefObject<boolean> }) => {
  useHookstate(getMutableState(EngineState).frameTime).value
  const rendererState = useHookstate(getMutableState(RendererState))
  const activeTab = useHookstate(getMutableState(DebugState).activeTab)

  const { t } = useTranslation()
  const hasActiveControlledAvatar =
    !!Engine.instance.localClientEntity && hasComponent(Engine.instance.localClientEntity, AvatarControllerComponent)

  const onClickRespawn = (): void => {
    Engine.instance.localClientEntity && respawnAvatar(Engine.instance.localClientEntity)
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
            {hasActiveControlledAvatar && (
              <button type="button" className={styles.flagBtn} id="respawn" onClick={onClickRespawn}>
                <Icon type="Refresh" />
              </button>
            )}
          </div>
        </div>
      </div>
      <StatsPanel show={showingStateRef.current} />
      <div className={styles.jsonPanel}>
        {['None'].concat(Object.keys(DebugTabs)).map((tab, i) => (
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
      {ActiveTabComponent && <ActiveTabComponent />}
    </div>
  )
}

export const DebugToggle = () => {
  const [isShowing, setShowing] = useState(false)
  const showingStateRef = useRef(isShowing)

  useEffect(() => {
    function downHandler({ keyCode }) {
      if (keyCode === 192) {
        showingStateRef.current = !showingStateRef.current
        setShowing(showingStateRef.current)
        getMutableState(EngineState).systemPerformanceProfilingEnabled.set(showingStateRef.current)
      }
    }
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [])

  return isShowing ? <Debug showingStateRef={showingStateRef} /> : <></>
}

export default DebugToggle
