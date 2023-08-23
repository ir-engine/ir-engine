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

import { AudioEffectPlayer } from '@etherealengine/engine/src/audio/systems/MediaSystem'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import IconButtonWithTooltip from '@etherealengine/ui/src/primitives/mui/IconButtonWithTooltip'
import { useTranslation } from 'react-i18next'
import { useShelfStyles } from '../Shelves/useShelfStyles'
import { useFullscreen } from '../useFullscreen'
import styles from './index.module.scss'

export const Fullscreen = () => {
  const { t } = useTranslation()
  const [fullScreenActive, setFullScreenActive] = useFullscreen()
  const { bottomShelfStyle } = useShelfStyles()
  return (
    <>
      {fullScreenActive ? (
        <IconButtonWithTooltip
          title={t('user:menu.exitFullScreen')}
          className={`${styles.btn} ${bottomShelfStyle} `}
          tooltipClassName={styles.fullScreen}
          background="white"
          onClick={() => setFullScreenActive(false)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type="FullscreenExit" />}
        />
      ) : (
        <IconButtonWithTooltip
          title={t('user:menu.enterFullScreen')}
          className={`${styles.btn} ${bottomShelfStyle} `}
          tooltipClassName={styles.fullScreen}
          background="white"
          onClick={() => setFullScreenActive(true)}
          onPointerUp={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
          icon={<Icon type="ZoomOutMap" />}
        />
      )}
    </>
  )
}
