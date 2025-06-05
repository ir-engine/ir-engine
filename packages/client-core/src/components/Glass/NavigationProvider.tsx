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

import React, { useState } from 'react'

type DirectionType = 1 | -1

type NavigationProviderType = {
  navigateTo: (screenKey: string, historyKey: string) => void
  activeHistoryKey: string
  sidebarKey: string
  setSidebarKey: (sidebarKey: string) => void
  createToggleSidebarKey: (sidebarKey: string) => () => void
  isSidebarOpen: boolean
  navigateClose: () => void
  navigateBack: () => void
  hasHistory: boolean
  direction: DirectionType
}

const useSidebarNavigation = () => {
  const [history, setHistory] = useState<string[]>([])
  const [direction, setDirection] = useState<DirectionType>(1) // 1 for forward, -1 for backward
  const [sidebarKey, setSidebarKey] = useState(``)

  const navigateTo = (screenKey: string, historyKey: string): void => {
    setSidebarKey(screenKey)
    setDirection(1)
    setHistory([...history, historyKey])
  }

  const navigateBack = (): void => {
    if (history.length > 1) {
      setDirection(-1)
      setHistory(history.slice(0, -1))
    } else {
      closeSidebar()
    }
  }

  const closeSidebar = () => setSidebarKey(``)

  const navigateClose = () => {
    setDirection(-1)
    setHistory([``])
    closeSidebar()
  }

  const createToggleSidebarKey = (sidebarKey) => () => {
    setSidebarKey((prev) => {
      return prev === sidebarKey ? `` : sidebarKey
    })
    setHistory([``])
  }

  const activeHistoryKey = history[history.length - 1]
  const isSidebarOpen = !!sidebarKey
  const hasHistory = !!activeHistoryKey

  return {
    activeHistoryKey,
    navigateBack,
    navigateTo,
    navigateClose,
    direction,
    history,

    setSidebarKey,
    sidebarKey,
    hasHistory,
    createToggleSidebarKey,
    isSidebarOpen
  }
}

const MultimediaStateContext = React.createContext({} as NavigationProviderType)

export const useNavigationProvider = () => React.useContext(MultimediaStateContext)

const Provider = MultimediaStateContext.Provider

export const NavigationProvider = ({ children }) => {
  const state = useSidebarNavigation()

  return <Provider value={state}>{children}</Provider>
}
