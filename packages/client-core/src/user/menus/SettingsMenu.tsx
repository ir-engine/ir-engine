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

import multiLogger from '@ir-engine/common/src/logger'
import { AudioState } from '@ir-engine/engine/src/audio/AudioState'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import { XRState } from '@ir-engine/spatial/src/xr/XRState'
import { Checkbox, Select } from '@ir-engine/ui'
import { Slider } from '@ir-engine/ui/editor'
import { ArrowNarrowLeftLg } from '@ir-engine/ui/src/icons'
import { OptionType } from '@ir-engine/ui/src/primitives/tailwind/Select'
import SidebarNavigation from '@ir-engine/ui/src/primitives/tailwind/SidebarNavigation'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { PopoverState } from '../../common/services/PopoverState'
import { XruiNameplateState } from '../../social/XruiNameplateState'
import BlockSlider from '../components/BlockSlider'
import ControllerMappingMobileImage from './images/controller-mapping-mobile.svg'
import ControllerMappingImage from './images/controller-mapping.png'
import KeyboardMappingImage from './images/keyboard-mapping.png'
import MouseMappingImage from './images/mouse-mapping.png'

const isChromeDesktop = !isMobile && /chrome/i.test(navigator.userAgent)
const logger = multiLogger.child({ component: 'system:settings-menu' })
export const ShadowMapResolutionOptions: OptionType[] = [
  {
    label: '256px',
    value: 256
  },
  {
    label: '512px',
    value: 512
  },
  {
    label: '1024px',
    value: 1024
  },
  {
    label: '2048px',
    value: 2048
  },
  {
    label: '4096px (not recommended)',
    value: 4096
  }
]

function GeneralTab() {
  const xrSupportedModes = useMutableState(XRState).supportedSessionModes
  const xrSupported = xrSupportedModes['immersive-ar'].value || xrSupportedModes['immersive-vr'].value

  return (
    <div>
      {!isMobile && !xrSupported && (
        <>
          <img src={KeyboardMappingImage} alt="Desktop Controls" className="mx-auto" />
          <div className="mx-auto grid grid-cols-2">
            <img src={ControllerMappingImage} alt="Controller Controls" className="col-span-1" />
            <img src={MouseMappingImage} alt="Controller Controls" className="col-span-1" />
          </div>
        </>
      )}
      {isMobile && <img src={ControllerMappingMobileImage} alt="Mobile Controls" />}
    </div>
  )
}

function AudioTab() {
  const { t } = useTranslation()
  const audioState = useMutableState(AudioState)

  return (
    <div className="h-full w-full">
      {isChromeDesktop && (
        <div className="py-2 text-xs">
          {t('user:usermenu.setting.chromeAEC')}
          <span className="font-bold underline">chrome://flags/#chrome-wide-echo-cancellation</span>
        </div>
      )}
      {/* <div className="mx-auto flex w-3/4 justify-center">
        <Checkbox
          variantTextPlacement="right"
          label={t('user:usermenu.setting.use-positional-media')}
          checked={audioState.positionalMedia.value}
          onChange={(value: boolean) => {
            audioState.positionalMedia.set(value)
            logger.analytics({ event_name: `spatial_user_av`, event_value: value })
          }}
        />
      </div> */}
      <div className="mx-auto mt-6 grid grid-cols-1 items-center gap-x-4 gap-y-2 lg:w-3/4 lg:gap-y-4">
        <BlockSlider
          label={t('user:usermenu.setting.lbl-microphone')}
          value={audioState.microphoneGain.value}
          onChange={(value) => {
            audioState.microphoneGain.set(value)
            logger.analytics({ event_name: `set_microphone_volume`, event_value: value })
          }}
        />
        <BlockSlider
          value={audioState.masterVolume.value}
          onChange={(value: number) => {
            audioState.masterVolume.set(value)
            logger.analytics({ event_name: `set_total_volume`, event_value: value })
          }}
          label={t('user:usermenu.setting.lbl-volume')}
        />
        <BlockSlider
          value={audioState.mediaStreamVolume.value}
          onChange={(value: number) => {
            audioState.mediaStreamVolume.set(value)
            logger.analytics({ event_name: `set_user_volume`, event_value: value })
          }}
          label={t('user:usermenu.setting.lbl-media-instance')}
        />
        <BlockSlider
          value={audioState.notificationVolume.value}
          onChange={(value: number) => {
            audioState.notificationVolume.set(value)
            logger.analytics({ event_name: `set_notification_volume`, event_value: value })
          }}
          label={t('user:usermenu.setting.lbl-notification')}
        />
        <BlockSlider
          value={audioState.soundEffectsVolume.value}
          onChange={(value: number) => {
            audioState.soundEffectsVolume.set(value)
            logger.analytics({ event_name: `set_scene_volume`, event_value: value })
          }}
          label={t('user:usermenu.setting.lbl-sound-effect')}
        />
        <BlockSlider
          value={audioState.backgroundMusicVolume.value}
          onChange={(value: number) => {
            audioState.backgroundMusicVolume.set(value)
            logger.analytics({ event_name: `set_music_volume`, event_value: value })
          }}
          label={t('user:usermenu.setting.lbl-background-music-volume')}
        />
      </div>
    </div>
  )
}

function GraphicsTab() {
  const { t } = useTranslation()
  const rendererState = useMutableState(RendererState)
  const xruiNameplateState = useMutableState(XruiNameplateState)

  const handleQualityLevelChange = (value: number) => {
    rendererState.qualityLevel.set(value)
    logger.analytics({ event_name: `set_quality_preset`, event_value: value })
    rendererState.automatic.set(false)
    logger.analytics({ event_name: `automatic_qp`, event_value: false })
  }
  return (
    <div className="h-full w-full">
      <div className="ml-auto mt-6 flex w-3/4 items-center gap-x-2">
        <div className="w-28 text-left text-sm text-text-primary">{t('user:usermenu.setting.lbl-quality')}</div>
        <Slider
          max={5}
          min={0}
          step={1}
          value={rendererState.qualityLevel.value}
          onChange={handleQualityLevelChange}
          onRelease={() => {}}
          label=""
        />
      </div>
      <div className="mb-2.5 ml-auto mt-4 w-3/4">
        <Checkbox
          onChange={() => {
            rendererState.usePostProcessing.set(!rendererState.usePostProcessing.value)
            logger.analytics({ event_name: `post_processing`, event_value: rendererState.usePostProcessing.value })
            rendererState.automatic.set(false)
            logger.analytics({ event_name: `automatic_qp`, event_value: false })
          }}
          checked={rendererState.usePostProcessing.value}
          label={t('user:usermenu.setting.lbl-pp')}
        />
      </div>
      <div className="mb-2.5 ml-auto w-3/4">
        <Checkbox
          onChange={() => {
            rendererState.useShadows.set(!rendererState.useShadows.value)
            logger.analytics({ event_name: `shadows`, event_value: rendererState.useShadows.value })
            rendererState.automatic.set(false)
            logger.analytics({ event_name: `automatic_qp`, event_value: false })
          }}
          checked={rendererState.useShadows.value}
          label={t('user:usermenu.setting.lbl-shadow')}
        />
      </div>
      <div className="mb-3 ml-auto w-3/4">
        <Checkbox
          onChange={() => {
            rendererState.automatic.set(!rendererState.automatic.value)
            logger.analytics({ event_name: `automatic_qp`, event_value: rendererState.automatic.value })
          }}
          checked={rendererState.automatic.value}
          label={t('user:usermenu.setting.lbl-automatic')}
        />
      </div>
      <div className="mx-auto my-1">
        <Select
          width="full"
          labelProps={{
            text: (
              <div className="whitespace-nowrap text-[#080808]">
                {t('editor:properties.directionalLight.lbl-shadowmapResolution')}
              </div>
            ) as any,
            position: 'top'
          }}
          value={rendererState.shadowMapResolution.value}
          options={ShadowMapResolutionOptions}
          onChange={(event) => {
            rendererState.shadowMapResolution.set(Number(event))
            logger.info({
              event_name: `change_shadow_map_resolution`,
              event_value: `${event}px`
            })
          }}
        />
      </div>
      <div className="my-1 ml-auto w-3/4">
        <Checkbox
          onChange={() => xruiNameplateState.isVisible.set(!xruiNameplateState.isVisible.value)}
          checked={xruiNameplateState.isVisible.value}
          label={t('user:usermenu.setting.lbl-isVisible')}
        />
      </div>
      {xruiNameplateState.isVisible.value && (
        <div className="ml-auto flex w-3/4 items-center gap-x-2">
          <div className="w-72 text-left text-sm text-text-primary">
            {t('user:usermenu.setting.lbl-triggerDistance')}
          </div>
          <Slider
            max={100}
            min={0}
            step={0.2}
            value={xruiNameplateState.triggerDistance.value}
            onChange={(value) => xruiNameplateState.triggerDistance.set(value)}
            onRelease={() => {}}
            label=""
          />
        </div>
      )}
    </div>
  )
}

export default function SettingsMenu() {
  const { t } = useTranslation()

  const currentTabIndex = useHookstate(0)
  const labels = [
    t('user:usermenu.setting.general'),
    t('user:usermenu.setting.audio'),
    t('user:usermenu.setting.graphics')
  ]

  const componentMap: Record<string, React.ReactNode> = {
    0: <GeneralTab />,
    1: <AudioTab />,
    2: <GraphicsTab />
  }

  return (
    <div className="absolute z-50 h-fit max-h-[90dvh] w-[50vw] min-w-[720px] max-w-2xl overflow-y-auto rounded-2xl bg-surface-4 p-6 text-text-secondary smh:max-h-[60dvh] smh:p-10">
      <div className="mb-[17px]">
        <button onClick={() => PopoverState.hidePopupover()}>
          <ArrowNarrowLeftLg />
        </button>
      </div>
      <SidebarNavigation
        currentTabIndex={currentTabIndex.value}
        labels={labels}
        onChange={(index) => {
          currentTabIndex.set(index)
        }}
      />
      {componentMap[currentTabIndex.value]}
    </div>
  )
}
