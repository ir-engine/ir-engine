import React from 'react'

import Icon from '@etherealengine/ui/src/Icon/index'

import { downloadScreenshot } from '../../../functions/takeScreenshot'
import { InfoTooltip } from '../../layout/Tooltip'
import * as styles from '../styles.module.scss'

export const SceneScreenshot = () => {
  return (
    <>
      <div id="scene-screenshot" className={styles.toolbarInputGroup + ' ' + styles.playButtonContainer}>
        <InfoTooltip title="Take a Screenshot">
          <button onClick={downloadScreenshot} className={styles.toolButton}>
            <Icon type={'CameraAlt'} fontSize="small" />
          </button>
        </InfoTooltip>
      </div>
    </>
  )
}

export default SceneScreenshot
