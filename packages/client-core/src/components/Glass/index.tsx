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

import React, { useLayoutEffect, useRef, useState } from 'react'

import { TouchGamepad } from '@ir-engine/client-core/src/common/components/TouchGamepad'
import { EngineState } from '@ir-engine/ecs'
import { getMutableState, NO_PROXY, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { useTranslation } from 'react-i18next'
import { LoadingSystemState } from '../../systems/state/LoadingState'
import { VideoWindows } from '../../user/VideoWindows'
import { ViewerMenuState } from '../../util/ViewerMenuState'
import { ARPlacement } from '../ARPlacement'
import { XRLoading } from '../XRLoading'

import { ToolbarAndSidebar } from './ToolbarAndSidebar'

import PopupMenu from '@ir-engine/ui/src/primitives/tailwind/PopupMenu'
import { ChatMenu } from './ChatMenu'
import { ToolbarMenu } from './ToolbarMenu'

const useIsPortrait = () => {
  const isPortrait = useHookstate(window.matchMedia('(orientation: portrait)').matches)

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

  return isPortrait
}

export const ViewerInteractions = () => {
  const isPortrait = useIsPortrait()
  const userID = useHookstate(getMutableState(EngineState).userID).value
  const loadingScreenVisible = useHookstate(getMutableState(LoadingSystemState).loadingScreenVisible).value
  const { t } = useTranslation()
  const externalInjectedMenus = useMutableState(ViewerMenuState).externalInjectedMenus.get(NO_PROXY)
  const locationContainer = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (locationContainer.current) locationContainer.current.style.opacity = '0'
  }, [locationContainer])

  const isLoggedIn = !!userID

  if (!isLoggedIn) return null

  const [sidebarKey, setSidebarKey] = useState(``)

  const isSidebarOpen = !!sidebarKey

  const createToggleSidebarKey = (sidebarKey) => () =>
    setSidebarKey((prev) => {
      return prev === sidebarKey ? `` : sidebarKey
    })

  const headings = {
    Chat: `Chat`,
    Video: `Video`,
    Cart: `Cart`,
    Share: `Share`
  }

  const tabs = {
    Chat: [
      {
        heading: `Video`,
        onClick: () => setSidebarKey(`Video`)
      },
      {
        heading: `Chat`,
        onClick: () => setSidebarKey(`Chat`),
        active: true
      }
    ],
    Video: [
      {
        heading: `Video`,
        onClick: () => setSidebarKey(`Video`),
        active: true
      },
      {
        heading: `Chat`,
        onClick: () => setSidebarKey(`Chat`)
      }
    ]
  }

  const contents = {
    Chat: <ChatMenu />
  }

  const onMessageClick = createToggleSidebarKey(`Chat`)
  const onShareClick = createToggleSidebarKey(`Share`)

  const toolbar = <ToolbarMenu onMessageClick={onMessageClick} onShareClick={onShareClick} />

  const sidebarTabs = tabs[sidebarKey] || []
  const sidebarHeading = headings[sidebarKey]
  const sidebarContent = isSidebarOpen && contents[sidebarKey]

  const closeSidebar = () => setSidebarKey(``)

  return (
    <div id="location-container" ref={locationContainer} className="fixed h-dvh w-full">
      <div className={`pointer-events-auto absolute left-6 top-6 select-none`}>
        <VideoWindows />
      </div>

      <ToolbarAndSidebar
        handleSidebarClose={closeSidebar}
        isSidebarOpen={isSidebarOpen}
        content={sidebarContent}
        heading={sidebarHeading}
        tabs={sidebarTabs}
        toolbar={toolbar}
      />

      <ARPlacement />
      <XRLoading />

      <TouchGamepad />
      <PopupMenu />
    </div>
  )
}
