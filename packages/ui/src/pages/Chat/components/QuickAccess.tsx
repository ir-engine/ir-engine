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

import React from 'react'
import { HiUserGroup } from 'react-icons/hi'
import { HiCog6Tooth } from 'react-icons/hi2'
import { RiVipCrownFill } from 'react-icons/ri'
import { ChatPageType } from '../ChatState'

interface QuickAccessProps {
  currentPage: ChatPageType
  onPageChange: (page: ChatPageType) => void
}

export const QuickAccess: React.FC<QuickAccessProps> = ({ currentPage, onPageChange }) => {
  const quickAccessItems = [
    { id: 'contacts', name: 'Contacts', icon: <HiUserGroup className="h-6 w-6" />, page: 'contacts' as ChatPageType },
    { id: 'premium', name: 'Premium', icon: <RiVipCrownFill className="h-6 w-6" /> },
    { id: 'settings', name: 'Settings', icon: <HiCog6Tooth className="h-6 w-6" />, page: 'settings' as ChatPageType }
  ]

  return (
    <div className="flex flex-col items-center space-y-2 pb-4">
      {quickAccessItems.map((item) => (
        <button
          key={item.id}
          className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
            currentPage === item.page
              ? 'bg-[#5865F2] text-white'
              : 'bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white'
          }`}
          onClick={() => item.page && onPageChange(item.page)}
          title={item.name}
        >
          {item.icon}
        </button>
      ))}
    </div>
  )
}
