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

import { ECSState } from '@ir-engine/ecs/src/ECSState'
import {
  defineState,
  getMutableState,
  syncStateWithLocalStorage,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import Tabs, { TabProps } from '@ir-engine/ui/src/primitives/tailwind/Tabs'
import React, { useEffect } from 'react'
import { APIDebug } from './APIDebug'
import DebugButtons from './DebugButtons'
import { EntityDebug } from './EntityDebug'
import { StateDebug } from './StateDebug'
import { StatsPanel } from './StatsPanel'
import { SystemDebug } from './SystemDebug'

export const DebugState = defineState({
  name: 'DebugState',
  initial: {
    enabled: false,
    activeTabIndex: 0
  },
  extension: syncStateWithLocalStorage(['enabled', 'activeTabIndex'])
})

const DebugTabs = {
  None: <></>,
  All: (
    <>
      <EntityDebug />
      <SystemDebug />
      <StateDebug />
      <APIDebug />
    </>
  ),
  Entities: <EntityDebug />,
  API: <APIDebug />,
  Systems: <SystemDebug />,
  State: <StateDebug />
}

const tabsData: TabProps['tabsData'] = Object.keys(DebugTabs).map((tabLabel) => ({
  tabLabel,
  bottomComponent: DebugTabs[tabLabel]
}))

const Debug = () => {
  useHookstate(getMutableState(ECSState).frameTime).value
  const activeTabIndex = useMutableState(DebugState).activeTabIndex

  return (
    <div className="pointer-events-auto fixed top-0 z-[1000] m-1 max-h-[95vh] overflow-y-auto rounded bg-neutral-700 p-0.5">
      <DebugButtons />
      <StatsPanel show />
      <Tabs
        tabsData={tabsData}
        currentTabIndex={activeTabIndex.value}
        onTabChange={(tabIndex) => activeTabIndex.set(tabIndex)}
      />
    </div>
  )
}

export const DebugToggle = () => {
  const isShowing = useHookstate(getMutableState(DebugState).enabled)

  useEffect(() => {
    function downHandler({ keyCode }) {
      if (keyCode === 192) {
        isShowing.set(!isShowing.value)
      }
    }
    window.addEventListener('keydown', downHandler)
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [])

  return isShowing.value ? <Debug /> : <></>
}

export default DebugToggle
