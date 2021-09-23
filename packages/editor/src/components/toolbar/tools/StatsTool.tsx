import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChartArea } from '@styled-icons/fa-solid/ChartArea'
import { SceneManager } from '../../../managers/SceneManager'
import { InfoTooltip } from '../../layout/Tooltip'
import styles from '../styles.module.scss'

/**
 * Stats used to show stats of  memory and  render.
 *
 * @author Robert Long
 * @constructor
 */
const StatsTool = () => {
  const [info, setInfo] = useState<any>({})
  const [isVisible, setVisible] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    SceneManager.instance.renderer.onUpdateStats = (info) => {
      if (info.render.frame % 3 === 0) {
        setInfo({
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          fps: (info.render as any).fps,
          frameTime: (info.render as any).frameTime,
          calls: info.render.calls,
          triangles: info.render.triangles,
          points: info.render.points,
          lines: info.render.lines
        })
      }
    }

    return () => {
      SceneManager.instance.renderer.onUpdateStats = undefined
    }
  }, [])

  const toggleStats = () => {
    setVisible(!isVisible)
  }

  /**
   * Rendering stats view in ViewportToolbar and shows when click on toggleStats
   *
   * @author Robert Long
   */
  return (
    <>
      <div className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer} id="stats">
        <InfoTooltip info="Toggle Stats">
          <button onClick={toggleStats} className={styles.toolButton + ' ' + (isVisible ? styles.selected : '')}>
            <ChartArea size={12} />
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
                    {t('editor:viewport.state.geometries')}: {(info as any).geometries}
                  </li>
                  <li>
                    {t('editor:viewport.state.textures')}: {(info as any).textures}
                  </li>
                </ul>
              </li>
              <li>
                {t('editor:viewport.state.render')}:
                <ul>
                  <li>
                    {t('editor:viewport.state.FPS')}: {Math.round((info as any).fps)}
                  </li>
                  <li>
                    {t('editor:viewport.state.frameTime')}: {Math.round((info as any).frameTime)}ms
                  </li>
                  <li>
                    {t('editor:viewport.state.calls')}: {(info as any).calls}
                  </li>
                  <li>
                    {t('editor:viewport.state.triangles')}: {(info as any).triangles}
                  </li>
                  <li>
                    {t('editor:viewport.state.points')}: {(info as any).points}
                  </li>
                  <li>
                    {t('editor:viewport.state.lines')}: {(info as any).lines}
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
