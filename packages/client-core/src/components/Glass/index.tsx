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

import { TouchGamepad } from '@ir-engine/client-core/src/common/components/TouchGamepad'
import { EngineState } from '@ir-engine/ecs'
import { getMutableState, useHookstate } from '@ir-engine/hyperflux'
import _ from 'lodash'
import React, { useLayoutEffect, useRef } from 'react'
import { LoadingSystemState } from '../../systems/state/LoadingState'
import { ARPlacement } from '../ARPlacement'
import { XRLoading } from '../XRLoading'

import { ToolbarAndSidebar } from './ToolbarAndSidebar'

import PopupMenu from '@ir-engine/ui/src/primitives/tailwind/PopupMenu'
import { useMediaWindows } from '../../user/VideoWindows'
import { useUserMediaWindowsHook } from '../../user/VideoWindows/hook'
import ReportUserMenu from '../ReportUser'
import Settings from '../Settings'
import { ChatMenu } from './ChatMenu'
import { ChatProvider } from './ChatProvider'
import { MultimediaStateProvider } from './MultimediaStateProvider'
import { VideoCarousel } from './MultiVideo'
import { NavigationProvider, NavigationService, useNavigationProvider } from './NavigationProvider'
import { ToolbarMenu } from './ToolbarMenu'
import { VideoMenu } from './VideoMenu'

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

NavigationService.addRoutes([
  {
    path: `chat`,
    title: 'Chat',
    Component: ChatMenu
  },
  {
    path: `video`,
    title: 'Video',
    Component: VideoMenu
  },
  {
    path: `settings`,
    title: `Settings`,
    Component: Settings
  },
  {
    path: `report`,
    title: `Report User`,
    Component: ReportUserMenu
  }
])

const Menu = () => {
  const isPortrait = useIsPortrait()
  const loadingScreenVisible = useHookstate(getMutableState(LoadingSystemState).loadingScreenVisible).value

  const locationContainer = useRef<HTMLDivElement>(null)
  const windows = useMediaWindows()

  const {
    current,
    routes,
    direction,
    first,
    isSidebarOpen,
    hasHistory,
    hasUp,

    navigateBack,
    navigateTo,
    navigateClose,
    togglePath_factory
  } = useNavigationProvider()

  const { title, Component = () => <></> } = routes[first] || {}

  const injectedButtons = _.filter(routes, ({ Button }) => !!Button).map(({ Button = () => <></> }, index) => {
    return <Button key={index} navigateTo={navigateTo} />
  })

  const tabs = {
    chat: [
      {
        heading: `Video`,
        onClick: () => navigateTo(`video`)
      },
      {
        heading: `Chat`,
        onClick: () => navigateTo(`chat`),
        active: true
      }
    ],
    video: [
      {
        heading: `Video`,
        onClick: () => navigateTo(`video`),
        active: true
      },
      {
        heading: `Chat`,
        onClick: () => navigateTo(`chat`)
      }
    ]
  }

  const onMessageClick = togglePath_factory(`chat`)
  const onShareClick = togglePath_factory(`settings/share`)
  const onFullscreenVideosClick = togglePath_factory(`video`)
  const onSettingsClick = togglePath_factory(`settings`)

  const sidebarTabs = tabs[current] || []

  const { videoElements, videoMediaStreams } = useUserMediaWindowsHook(windows)
  const showBack = hasHistory || hasUp

  useLayoutEffect(() => {
    if (locationContainer.current) locationContainer.current.style.opacity = '0'
  }, [locationContainer])

  const toolbar = (
    <ToolbarMenu
      onMessageClick={onMessageClick}
      onShareClick={onShareClick}
      onSettingsClick={onSettingsClick}
      activePath={current}
    />
  )

  return (
    <div id="location-container" ref={locationContainer} className="fixed h-dvh w-full">
      <VideoCarousel
        handleSidebarOpen={onFullscreenVideosClick}
        videoElements={videoElements}
        videoMediaStreams={videoMediaStreams}
      />

      <ToolbarAndSidebar
        handleSidebarClose={navigateClose}
        handleSidebarBack={navigateBack}
        isSidebarOpen={isSidebarOpen}
        content={<Component />}
        title={title}
        tabs={sidebarTabs}
        toolbar={toolbar}
        showBack={showBack}
      />

      {injectedButtons}

      <ARPlacement />
      <XRLoading />

      <TouchGamepad />
      <PopupMenu />
    </div>
  )
}

export const ViewerInteractions = () => {
  const userID = useHookstate(getMutableState(EngineState).userID).value
  const isLoggedIn = !!userID

  if (!isLoggedIn) return null

  return (
    <NavigationProvider>
      <MultimediaStateProvider>
        <ChatProvider>
          <Menu />
        </ChatProvider>
      </MultimediaStateProvider>
    </NavigationProvider>
  )
}
