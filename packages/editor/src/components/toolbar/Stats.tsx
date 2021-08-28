import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import styles from './styles.module.scss'

/**
 * Stats used to show stats of  memory and  render.
 *
 * @author Robert Long
 * @param   {any} editor
 * @constructor
 */
export function Stats({ editor }) {
  const [info, setInfo] = useState(0)
  const { t } = useTranslation()

  useEffect(() => {
    editor.renderer.onUpdateStats = (info) => {
      if (info.render.frame % 3 === 0) {
        setInfo({
          /* @ts-ignore */
          geometries: info.memory.geometries,
          textures: info.memory.textures,
          fps: info.render.fps,
          frameTime: info.render.frameTime,
          calls: info.render.calls,
          triangles: info.render.triangles,
          points: info.render.points,
          lines: info.render.lines
        })
      }
    }

    return () => {
      editor.renderer.onUpdateStats = undefined
    }
  }, [editor])

  /**
   * Rendering stats view in ViewportToolbar and shows when click on toggleStats
   *
   * @author Robert Long
   */
  return (
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
  )
}

Stats.propTypes = {
  editor: PropTypes.object
}
export default Stats
