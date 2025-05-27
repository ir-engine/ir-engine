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

import { MessageTextSquare01Lg } from '@ir-engine/ui/src/icons'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { ChatPageType } from '../ChatState'
import { QuickAccess } from './QuickAccess'
import { WorkspaceList } from './WorkspaceList'

interface GlobalNavPaneProps {
  currentPage: ChatPageType
  onPageChange: (page: ChatPageType) => void
}

export const GlobalNavPane: React.FC<GlobalNavPaneProps> = ({ currentPage, onPageChange }) => {
  return (
    <div className="flex h-full w-20 flex-col bg-[#1E1F22] text-white">
      <div className="flex flex-col items-center py-4">
        <button
          className={twMerge(
            'mb-4 flex h-12 w-12 items-center justify-center rounded-full transition-all',
            currentPage === 'directMessages'
              ? 'bg-[#5865F2] text-white'
              : 'bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white'
          )}
          onClick={() => onPageChange('directMessages')}
          title="Direct Messages"
        >
          <MessageTextSquare01Lg className="h-6 w-6" />
        </button>
        <div className="my-2 h-0.5 w-10 bg-gray-700"></div>
      </div>

      <WorkspaceList currentPage={currentPage} onPageChange={onPageChange} />

      <div className="mt-auto">
        <QuickAccess currentPage={currentPage} onPageChange={onPageChange} />
      </div>
    </div>
  )
}
