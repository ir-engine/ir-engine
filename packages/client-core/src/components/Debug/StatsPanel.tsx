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

import { useHookstate } from '@hookstate/core'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RenderInfoState } from '@etherealengine/engine/src/renderer/RenderInfoSystem'
import { getMutableState } from '@etherealengine/hyperflux'

import Stats from './stats'
import styles from './styles.module.scss'

export const StatsPanel = (props: { show: boolean }) => {
  const renderInfoState = useHookstate(getMutableState(RenderInfoState))
  const info = renderInfoState.visible.value && renderInfoState.info.value

  const toggleStats = () => {
    renderInfoState.visible.set(!renderInfoState.visible.value)
  }

  const { t } = useTranslation()
  const [statsArray, setStatsArray] = useState<ReturnType<typeof Stats>[]>([])
  const statsRef = useRef<HTMLDivElement>(null)
  let animateId = 0

  useEffect(() => {
    return () => cancelAnimationFrame(animateId)
  }, [])

  useEffect(() => {
    setupStatsArray()
    if (props.show) animateId = requestAnimationFrame(animate)
    else cancelAnimationFrame(animateId)
  }, [props.show])

  const setupStatsArray = () => {
    if (!statsRef.current) return

    statsRef.current.innerHTML = ''

    for (let i = 0; i < 3; i++) {
      statsArray[i] = Stats()
      statsArray[i].showPanel(i)
      statsRef.current?.appendChild(statsArray[i].dom)
    }

    setStatsArray([...statsArray])
  }

  const animate = () => {
    for (const stats of statsArray) stats.update()
    animateId = requestAnimationFrame(animate)
  }

  return (
    <div className={styles.statsContainer}>
      <h1>{t('common:debug.stats')}</h1>
      <div ref={statsRef} className={styles.statsBlock} />
      <button
        onClick={toggleStats}
        className={styles.flagBtn + (renderInfoState.visible.value ? ' ' + styles.active : '')}
        style={{ width: '100px' }}
      >
        {renderInfoState.visible.value ? 'Hide' : 'Show'}
      </button>
      {info && (
        <ul>
          <li>
            {t('editor:viewport.state.memory')}
            <ul>
              <li>
                {t('editor:viewport.state.geometries')}: {info.geometries}
              </li>
              <li>
                {t('editor:viewport.state.textures')}: {info.textures}
              </li>
            </ul>
          </li>
          <li>
            {t('editor:viewport.state.render')}:
            <ul>
              <li>
                {t('editor:viewport.state.FPS')}: {Math.round(info.fps)}
              </li>
              <li>
                {t('editor:viewport.state.frameTime')}: {Math.round(info.frameTime)}ms
              </li>
              <li>
                {t('editor:viewport.state.calls')}: {info.calls}
              </li>
              <li>
                {t('editor:viewport.state.triangles')}: {info.triangles}
              </li>
              <li>
                {t('editor:viewport.state.points')}: {info.points}
              </li>
              <li>
                {t('editor:viewport.state.lines')}: {info.lines}
              </li>
            </ul>
          </li>
        </ul>
      )}
    </div>
  )
}
