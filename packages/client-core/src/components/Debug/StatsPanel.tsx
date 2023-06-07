import { useHookstate } from '@hookstate/core'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RenderInfoState } from '@etherealengine/engine/src/renderer/RenderInfoSystem'
import { getMutableState } from '@etherealengine/hyperflux'

import SsidChartIcon from '@mui/icons-material/SsidChart'

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
