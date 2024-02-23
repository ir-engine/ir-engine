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
import AdminProject from './components/project'

const sideBarItems = [
  { label: 'Dashboard', icon: <HiOutlineHome /> },
  { label: 'Projects', icon: <HiOutlineTableCells /> },
  { label: 'Location', icon: <HiOutlineMapPin /> },
  { label: 'Instances', icon: <HiCube /> },
  { label: 'Servers', icon: <HiServer /> },
  { label: 'Avatars', icon: <HiUserCircle /> },
  { label: 'Plugins', icon: <HiSquaresPlus /> },
  // {label: 'Teams', icon: <HiUsers />},
  { label: 'Users', icon: <HiUser /> },
  { label: 'Invites', icon: <RiSendPlaneFill /> },
  { label: 'Recordings', icon: <HiPlay /> },
  { label: 'Files', icon: <HiFolder /> },
  { label: 'Settings', icon: <HiCog8Tooth /> }
]

const AdminSidebar = () => {
  return (
    <aside className="bg-theme-surfaceMain mx-8 min-w-[15vw] rounded-lg px-2 py-4">
      <ul className="space-y-2">
        {sideBarItems.map((item) => (
          <li key={item.label}>
            <a
              href="#"
              className="text-theme-secondary flex items-center gap-3 rounded-xl px-2 py-3 hover:bg-[#212226]"
            >
              {item.icon}
              {item.label}
            </a>
          </li>
        ))}
        <li>
          <a href="#" className="text-theme-secondary my-2 flex items-center rounded-sm px-2 py-3 hover:bg-[#212226]">
            <HiArrowRightOnRectangle />
            Log Out
          </a>
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
        <AdminProject />
      </div>
      <PopupMenu />
    </main>
  )
}

export default Admin
