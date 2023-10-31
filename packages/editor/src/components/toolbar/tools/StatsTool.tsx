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
        <InfoTooltip title={t('editor:toolbar.stats.lbl')} info={t('editor:toolbar.stats.info')}>
          <button onClick={toggleStats} className={styles.toolButton + ' ' + (isVisible ? styles.selected : '')}>
            <SsidChartIcon fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
      {isVisible && (
        <div className={styles.statsContainer}>
          <h3>{t('editor:viewport.state.header')}</h3>
          {info && (
            <ul style={{ listStyle: 'none' }}>
              <li>
                {t('editor:viewport.state.memory')}
                <ul style={{ listStyle: 'none' }}>
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
                <ul style={{ listStyle: 'none' }}>
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
