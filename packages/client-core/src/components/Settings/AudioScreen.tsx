import multiLogger from '@ir-engine/common/src/logger'
import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import { useMutableState } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { clientContextParams } from '../../util/ClientContextState'
import { Section } from './Section'
import SliderItem from './SliderItem'

const isChromeDesktop = !isMobile && /chrome/i.test(navigator.userAgent)
const logger = multiLogger.child({ component: 'client-core:AudioScreen', modifier: clientContextParams })

export default function AudioScreen() {
  const { t } = useTranslation()
  const audioState = useMutableState(AudioState)

  return (
    <div className="flex h-full w-full flex-col gap-4">
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
            console.log({ value })
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
    </div>
  )
}
