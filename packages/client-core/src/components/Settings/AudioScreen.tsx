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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import multiLogger from '@ir-engine/common/src/logger'
import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import { useMutableState } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { clientContextParams } from '../../util/ClientContextState'
import { Inner } from '../Glass/ToolbarAndSidebar'
import { Section } from './Section'
import SliderItem from './SliderItem'

const isChromeDesktop = !isMobile && /chrome/i.test(navigator.userAgent)
const logger = multiLogger.child({ component: 'client-core:AudioScreen', modifier: clientContextParams })

export default function AudioScreen() {
  const { t } = useTranslation()
  const audioState = useMutableState(AudioState)

  return (
    <Inner className="flex min-h-full w-full flex-col gap-4">
      {isChromeDesktop && (
        <div className="py-2 text-xs">
          {t('user:usermenu.setting.chromeAEC')}
          <span className="font-bold underline">chrome://flags/#chrome-wide-echo-cancellation</span>
        </div>
      )}
      <Section data-testid="audio-settings">
        <SliderItem
          label={t('user:usermenu.setting.lbl-master-volume')}
          value={audioState.masterVolume.value}
          min={0}
          max={1}
          step={0.01}
          onChange={(value: number) => {
            audioState.masterVolume.set(value)
            logger.analytics({ event_name: `set_total_volume`, event_value: value })
          }}
        />
        <SliderItem
          label={t('user:usermenu.setting.lbl-user-volume')}
          value={audioState.mediaStreamVolume.value}
          min={0}
          max={1}
          step={0.01}
          onChange={(value: number) => {
            audioState.mediaStreamVolume.set(value)
            logger.analytics({ event_name: `set_user_volume`, event_value: value })
          }}
        />
        <SliderItem
          label={t('user:usermenu.setting.lbl-background-music-volume')}
          value={audioState.backgroundMusicVolume.value}
          min={0}
          max={1}
          step={0.01}
          onChange={(value: number) => {
            audioState.backgroundMusicVolume.set(value)
            logger.analytics({ event_name: `set_music_volume`, event_value: value })
          }}
        />
      </Section>
    </Inner>
  )
}
