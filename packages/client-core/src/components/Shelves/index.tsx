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
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Icon from '@etherealengine/ui/src/primitives/mui/Icon'

import IconButtonWithTooltip from '@etherealengine/ui/src/primitives/mui/IconButtonWithTooltip'
import { useTranslation } from 'react-i18next'
import { AppState } from '../../common/services/AppService'
import styles from './index.module.scss'

export const Shelves = () => {
  const { t } = useTranslation()

  const appState = useHookstate(getMutableState(AppState))
  const showTopShelf = appState.showTopShelf.value
  const showBottomShelf = appState.showBottomShelf.value

  const handleShowMediaIcons = () => {
    appState.showTopShelf.set((prevValue) => !prevValue)
  }

  const handleShowBottomIcons = () => {
    appState.showBottomShelf.set((prevValue) => !prevValue)
  }

  return (
    <div style={{ pointerEvents: 'auto' }}>
      <IconButtonWithTooltip
        className={`${showTopShelf ? styles.btn : styles.smBtn} ${showTopShelf ? styles.rotate : styles.rotateBack}`}
        tooltipClassName={styles.showIconMedia}
        title={showTopShelf ? t('user:menu.hide') : t('user:menu.show')}
        onClick={handleShowMediaIcons}
        onPointerDown={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        icon={<Icon type={showTopShelf ? 'KeyboardDoubleArrowUp' : 'KeyboardDoubleArrowDown'} />}
      />
      <IconButtonWithTooltip
        className={`${showBottomShelf ? styles.btn : styles.smBtn} ${
          showBottomShelf ? styles.rotate : styles.rotateBack
        } `}
        tooltipClassName={styles.showIcon}
        title={showBottomShelf ? t('user:menu.hide') : t('user:menu.show')}
        onClick={handleShowBottomIcons}
        onPointerDown={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        onPointerEnter={() => AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)}
        icon={<Icon type={showBottomShelf ? 'KeyboardDoubleArrowDown' : 'KeyboardDoubleArrowUp'} />}
      />
    </div>
  )
}
