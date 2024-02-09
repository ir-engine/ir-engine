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
import React, { useEffect } from 'react'
import { GrGithub, GrUpdate } from 'react-icons/gr'
import {
  HiArrowRightOnRectangle,
  HiCog8Tooth,
  HiCube,
  HiFolder,
  HiLink,
  HiOutlineHome,
  HiOutlineMapPin,
  HiOutlineTableCells,
  HiPlay,
  HiServer,
  HiSquaresPlus,
  HiUser,
  HiUserCircle
} from 'react-icons/hi2'
import { IoFolderOutline, IoPeopleOutline, IoTerminalOutline } from 'react-icons/io5'
import { RiDeleteBinLine, RiSendPlaneFill } from 'react-icons/ri'

import { useRemoveEngineCanvas } from '@etherealengine/client-core/src/hooks/useRemoveEngineCanvas'
import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import Table, {
  TableBody,
  TableCell,
  TableHeadRow,
  TableHeaderCell,
  TablePagination,
  TableRow
} from '@etherealengine/ui/src/primitives/tailwind/Table'

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

const data = [
  {
    name: 'Andy Levius',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'xking@yahoo.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'dhomas@outlook.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'iramirez@icloud.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'iharris@icloud.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'nmitchell@yahoo.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  },

  {
    name: 'qadams@aol.com',
    version: '0.1.2',
    commitHash: '56b1a80a',
    date: 'Jan 6, 2023, 9:14 PM'
  }
]
const headerLabels = ['Name', 'Version', 'Commit Hash', 'Date', 'Actions']
const dataKeys = ['name', 'version', 'commitHash', 'date']

const AdminTable = () => {
  return (
    <Table>
      <TableHeadRow>
        {headerLabels.map((label, index) => (
          <TableHeaderCell key={index}>{label}</TableHeaderCell>
        ))}
      </TableHeadRow>
      <TableBody>
        {data.map((row, index) => (
          <TableRow key={index}>
            {dataKeys.map((key, index) => (
              <TableCell key={index}>{row[key]}</TableCell>
            ))}
            <TableCell>
              <div className="flex justify-evenly">
                <Button startIcon={<GrUpdate />} size="small" className="bg-[#61759f] dark:bg-[#2A3753]">
                  Update
                </Button>
                <Button startIcon={<GrGithub />} size="small" className="bg-[#61759f] dark:bg-[#2A3753]">
                  Push
                </Button>
                <Button startIcon={<HiLink />} size="small" className="bg-[#61759f] dark:bg-[#2A3753]">
                  Repo
                </Button>
                <Button startIcon={<IoPeopleOutline />} size="small" className="bg-[#61759f] dark:bg-[#2A3753]">
                  Access
                </Button>
                <Button startIcon={<IoTerminalOutline />} size="small" className="bg-[#61759f] dark:bg-[#2A3753]">
                  Invalidate Cache
                </Button>
                <Button startIcon={<IoFolderOutline />} size="small" className="bg-[#61759f] dark:bg-[#2A3753]">
                  View
                </Button>
                <Button startIcon={<RiDeleteBinLine />} size="small" className="bg-[#61759f] dark:bg-[#2A3753]">
                  Remove
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TablePagination totalPages={5} currentPage={3} onPageChange={() => {}} />
    </Table>
  )
}

const AdminSidebar = () => {
  return (
    <aside className="bg-theme-surfaceMain w-[15vw] mx-8 px-2 py-4 rounded-lg">
      <ul className="space-y-8">
        {sideBarItems.map((item) => (
          <li>
            <a
              href="#"
              className="flex items-center gap-3 text-theme-secondary my-3 mx-4 rounded-sm hover:bg-[#212226]"
            >
              {item.icon}
              {item.label}
            </a>
          </li>
        ))}
        <li>
          <a href="#" className="flex items-center gap-3 text-theme-secondary my-5 mx-4 rounded-sm hover:bg-[#212226]">
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
    <main className="mt-6 flex gap-1.5">
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
      <AdminTable />
    </main>
  )
}

export default Admin
