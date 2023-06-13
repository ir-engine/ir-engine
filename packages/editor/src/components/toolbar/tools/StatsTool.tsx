import React from 'react'
import { useTranslation } from 'react-i18next'

import { RenderInfoState } from '@etherealengine/engine/src/renderer/RenderInfoSystem'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import SsidChartIcon from '@mui/icons-material/SsidChart'

import { InfoTooltip } from '../../layout/Tooltip'
import styles from '../styles.module.scss'

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
