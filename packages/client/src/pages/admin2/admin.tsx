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

import { ThemeState } from '@etherealengine/client-core/src/common/services/ThemeService'
import { useRemoveEngineCanvas } from '@etherealengine/client-core/src/hooks/useRemoveEngineCanvas'
import '@etherealengine/engine/src/EngineModule'
import { defineState, getMutableState, useHookstate } from '@etherealengine/hyperflux'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import PopupMenu from '@etherealengine/ui/src/primitives/tailwind/PopupMenu'
import React, { useEffect } from 'react'
import {
  HiArrowRightOnRectangle,
  HiCog8Tooth,
  HiCube,
  HiFolder,
  HiOutlineHome,
  HiOutlineMapPin,
  HiOutlineTableCells,
  HiPlay,
  HiServer,
  HiSquaresPlus,
  HiUser,
  HiUserCircle
} from 'react-icons/hi2'
import { RiSendPlaneFill } from 'react-icons/ri'
import Avatars from './components/avatar'
import AdminProject from './components/project'

const sideBarItems = [
  { label: 'Dashboard', icon: <HiOutlineHome />, component: AdminProject },
  { label: 'Projects', icon: <HiOutlineTableCells />, component: AdminProject },
  { label: 'Location', icon: <HiOutlineMapPin />, component: AdminProject },
  { label: 'Instances', icon: <HiCube />, component: AdminProject },
  { label: 'Servers', icon: <HiServer />, component: AdminProject },
  { label: 'Avatars', icon: <HiUserCircle />, component: Avatars },
  { label: 'Plugins', icon: <HiSquaresPlus />, component: AdminProject },
  // {label: 'Teams', icon: <HiUsers />},
  { label: 'Users', icon: <HiUser />, component: AdminProject },
  { label: 'Invites', icon: <RiSendPlaneFill />, component: AdminProject },
  { label: 'Recordings', icon: <HiPlay />, component: AdminProject },
  { label: 'Files', icon: <HiFolder />, component: AdminProject },
  { label: 'Settings', icon: <HiCog8Tooth />, component: AdminProject }
]

const CurrentPageState = defineState({
  name: 'eepro.multitenancy.AdminPageState',
  initial: 0
})

const AdminSidebar = () => {
  const currentPage = useHookstate(getMutableState(CurrentPageState))

  return (
    <aside className="bg-theme-surfaceMain mx-8 min-w-[25vw] rounded-lg px-2 py-4 md:min-w-[20vw] lg:min-w-[15vw]">
      <ul className="space-y-2">
        {sideBarItems.map((item, index) => (
          <li key={index}>
            <Button
              fullWidth
              onClick={() => currentPage.set(index)}
              className="bg-theme-surfaceMain text-theme-secondary flex items-center justify-start rounded-xl px-2 py-3 hover:bg-[#212226]"
              startIcon={item.icon}
            >
              {item.label}
            </Button>
          </li>
        ))}
        <li>
          <Button
            className="bg-theme-surfaceMain text-theme-secondary my-2 flex items-center rounded-sm px-2 py-3 hover:bg-[#212226]"
            startIcon={<HiArrowRightOnRectangle />}
          >
            Log Out
          </Button>
        </li>
      </ul>
    </aside>
  )
}

const Admin = () => {
  useRemoveEngineCanvas()
  useEffect(() => {
    ThemeState.setTheme('dark')
  }, [])

  const currentPage = useHookstate(getMutableState(CurrentPageState))
  const PageComponent = sideBarItems[currentPage.value].component

  return (
    <main className="pointer-events-auto mt-6 flex gap-1.5">
      {/* only for multitenancy
       <nav className="w-full px-8 py-4 mb-1.5 flex items-center justify-between bg-theme-surfaceMain">
        <img src={EELogo} className="h-8 w-8" />
        <div className="h-full flex items-center gap-8">
          <Text theme='secondary'>Dashboard</Text>
          <div className='flex items-center border-b border-b-blue-400'><Text>Admin</Text></div>
          <Text theme='secondary'>Store</Text>
          <Text theme='secondary'>Documentation</Text>
        </div>
        <img src={EELogo} className="h-8 w-8" />
      </nav>  */}
      <AdminSidebar />
      <div className="w-[80%]">
        <PageComponent />
      </div>
      <PopupMenu />
    </main>
  )
}

export default Admin
