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

import React, { useLayoutEffect } from 'react'

import { TouchGamepad } from '@ir-engine/client-core/src/common/components/TouchGamepad'
import UserMenus from '@ir-engine/client-core/src/user/menus'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'

import { EngineState } from '@ir-engine/ecs'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { useTranslation } from 'react-i18next'
import { LoadingSystemState } from '../../systems/state/LoadingState'
import InstanceChat from '../../user/InstanceChat'
import { VideoWindows } from '../../user/VideoWindows'
import { ARPlacement } from '../ARPlacement'
import { Fullscreen } from '../Fullscreen'
import { MediaIconsBox } from '../MediaIconsBox'
import { XRLoading } from '../XRLoading'
import ScreenRotateImage from './screen-rotate.svg'

export const ViewerInteractions = () => {
  const isPortrait = useHookstate(window.matchMedia('(orientation: portrait)').matches)
  const userID = useHookstate(getMutableState(EngineState).userID).value
  const loadingScreenOpacity = useHookstate(getMutableState(LoadingSystemState).loadingScreenOpacity)
  const { t } = useTranslation()

  useLayoutEffect(() => {
    const orientationChangeHandler = () => {
      if (screen.orientation.type.match('portrait')) {
        isPortrait.set(true)
      } else {
        isPortrait.set(false)
      }
    }
    screen.orientation.addEventListener('change', orientationChangeHandler)
    return () => {
      screen.orientation.removeEventListener('change', orientationChangeHandler)
    }
  }, [])

  if (!userID) return null

  if (isMobile && isPortrait.value) {
    return (
      <div className="grid h-screen w-screen place-items-center bg-[#070708]">
        <div className="flex flex-col items-center justify-center gap-y-4">
          <span>{t('user:messages.rotateLandscape')}</span>
          <img src={ScreenRotateImage} className="h-20 w-16" />
        </div>
      </div>
    )
  }

  return (
    <div style={{ opacity: 1 - loadingScreenOpacity.value }} className="relative h-dvh w-full p-6">
      <div className="pointer-events-auto absolute left-0 top-0 h-fit w-full pt-[inherit]">
        <MediaIconsBox />
      </div>

      <div className="pointer-events-auto absolute left-0 top-0 pl-[inherit] pt-[inherit]">
        <VideoWindows />
      </div>

      <div className="pointer-events-auto absolute bottom-0 left-0 h-fit w-full pb-[inherit]">
        <UserMenus />
      </div>

      <div className="pointer-events-auto absolute bottom-0 left-0 pb-[inherit] pl-[inherit]">
        {!isMobile && <Fullscreen />}
      </div>

      <div className="pointer-events-auto absolute bottom-0 right-0 pb-[inherit] pr-[inherit]">
        <InstanceChat />
      </div>

      <ARPlacement />
      <XRLoading />

      <TouchGamepad />
    </div>
  )
}
