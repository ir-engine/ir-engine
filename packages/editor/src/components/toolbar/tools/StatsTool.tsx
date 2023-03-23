import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { SystemUpdateType } from '@etherealengine/engine/src/ecs/functions/SystemUpdateType'
import { useSystems } from '@etherealengine/engine/src/ecs/functions/useSystems'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { defineState, getMutableState, getState, useHookstate } from '@etherealengine/hyperflux'

import SsidChartIcon from '@mui/icons-material/SsidChart'

import { InfoTooltip } from '../../layout/Tooltip'
import styles from '../styles.module.scss'

export const RenderInfoState = defineState({
  name: 'RenderInfoState',
  initial: {
    visible: false,
    info: {
      geometries: 0,
      textures: 0,
      fps: 0,
      frameTime: 0,
      calls: 0,
      triangles: 0,
      points: 0,
      lines: 0
    }
  }
})

async function RenderInfoSystem() {
  const state = getMutableState(RenderInfoState)

  const execute = () => {
    if (state.visible.value) {
      const info = EngineRenderer.instance.renderer.info

      const fps = 1 / Engine.instance.deltaSeconds
      const frameTime = Engine.instance.deltaSeconds * 1000

      state.info.set({
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        fps,
        frameTime,
        calls: info.render.calls,
        triangles: info.render.triangles,
        points: info.render.points,
        lines: info.render.lines
      })

      info.reset()
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}

const RenderInfoSystemDefintion = {
  uuid: 'xre.engine.RenderInfoSystem',
  type: SystemUpdateType.POST_RENDER,
  systemLoader: () => Promise.resolve({ default: RenderInfoSystem })
}

/**
 * Stats used to show stats of  memory and  render.
 *
 * @constructor
 */
const StatsTool = () => {
  const renderInfoState = useHookstate(getMutableState(RenderInfoState))
  const info = renderInfoState.info.value
  const isVisible = renderInfoState.visible.value

  const { t } = useTranslation()

  useSystems([RenderInfoSystemDefintion])

  const toggleStats = () => {
    renderInfoState.visible.set(!isVisible)
  }

  /**
   * Rendering stats view in ViewportToolbar and shows when click on toggleStats
   */
  return (
    <>
      <div className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer} id="stats">
        <InfoTooltip title="Toggle Stats">
          <button onClick={toggleStats} className={styles.toolButton + ' ' + (isVisible ? styles.selected : '')}>
            <SsidChartIcon fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
      {isVisible && (
        <div className={styles.statsContainer}>
          <h3>{t('editor:viewport.state.header')}</h3>
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
      )}
    </>
  )
}

export default StatsTool
