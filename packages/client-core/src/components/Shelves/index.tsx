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

import React from 'react'
import { useTranslation } from 'react-i18next'

import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'
import { useMutableState } from '@ir-engine/hyperflux'
import Icon from '@ir-engine/ui/src/primitives/mui/Icon'
import IconButtonWithTooltip from '@ir-engine/ui/src/primitives/mui/IconButtonWithTooltip'

import multiLogger from '@ir-engine/common/src/logger'
import { AppState } from '../../common/services/AppService'
import { clientContextParams } from '../../util/ClientContextState'
import styles from './index.module.scss'

const logger = multiLogger.child({ component: 'system:Shelves ', modifier: clientContextParams })

export const Shelves = () => {
  const { t } = useTranslation()

  const appState = useMutableState(AppState)
  const showTopShelf = appState.showTopShelf.value
  const showBottomShelf = appState.showBottomShelf.value

  const handleShowMediaIcons = () => {
    appState.showTopShelf.set((prevValue) => {
      logger.info({ event_name: prevValue ? 'header_hide' : 'header_show', event_value: true })
      return !prevValue
    })
  }

  const handleShowBottomIcons = () => {
    appState.showBottomShelf.set((prevValue) => {
      logger.info({ event_name: prevValue ? 'footer_hide' : 'footer_show', event_value: true })
      return !prevValue
    })
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <IconButtonWithTooltip
        type="solid"
        title={showTopShelf ? t('user:menu.hide') : t('user:menu.show')}
        icon={<Icon type={showTopShelf ? 'KeyboardDoubleArrowUp' : 'KeyboardDoubleArrowDown'} />}
        sizePx={50}
        className={`${showTopShelf ? styles.rotate : styles.rotateBack}`}
        tooltipClassName={styles.topIcon}
        onClick={handleShowMediaIcons}
        onPointerDown={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        style={{ zIndex: 1000 }}
      />
      <IconButtonWithTooltip
        type="solid"
        title={showBottomShelf ? t('user:menu.hide') : t('user:menu.show')}
        icon={<Icon type={showBottomShelf ? 'KeyboardDoubleArrowDown' : 'KeyboardDoubleArrowUp'} />}
        sizePx={50}
        className={`${showBottomShelf ? styles.rotate : styles.rotateBack}`}
        tooltipClassName={styles.bottomIcon}
        onClick={handleShowBottomIcons}
        onPointerDown={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
      />
    </div>
  )
}
