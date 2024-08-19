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

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'
import IconButtonWithTooltip from '@ir-engine/ui/src/primitives/mui/IconButtonWithTooltip'

import multiLogger from '@ir-engine/common/src/logger'
import { clientContextParams } from '../../util/contextParams'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import styles from './index.module.scss'

const logger = multiLogger.child({ component: 'client-core:FullScreen', modifier: clientContextParams })

export const Fullscreen = () => {
  const { t } = useTranslation()
  const [fullScreenActive, setFullScreenActive] = useState(false)
  const { bottomShelfStyle } = useShelfStyles()

  const setFullscreen = (input: boolean) => {
    setFullScreenActive(input)
    if (input) document.body.requestFullscreen()
    else document.exitFullscreen()
    logger.info({ event_name: 'view_fullscreen', event_value: input })
  }

  return (
    <div className={styles.fullScreen}>
      {fullScreenActive ? (
        <IconButtonWithTooltip
          title={t('user:menu.exitFullScreen')}
          className={`${styles.btn} ${bottomShelfStyle}`}
          background="white"
          onClick={() => setFullscreen(false)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type="FullscreenExit" />}
        />
      ) : (
        <IconButtonWithTooltip
          title={t('user:menu.enterFullScreen')}
          className={`${styles.btn} ${bottomShelfStyle}`}
          background="white"
          onClick={() => setFullscreen(true)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type="ZoomOutMap" />}
        />
      )}
    </div>
  )
}
