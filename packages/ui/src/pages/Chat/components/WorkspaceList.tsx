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

import { useMutableState } from '@ir-engine/hyperflux'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { ChatPageType, NewChatState } from '../ChatState'

interface WorkspaceListProps {
  currentPage: ChatPageType
  onPageChange: (page: ChatPageType) => void
}

export const WorkspaceList: React.FC<WorkspaceListProps> = ({ currentPage, onPageChange }) => {
  const chatState = useMutableState(NewChatState)

  const workspaces = [
    { id: 'workspace1', name: 'Workspace 1', letter: 'W1' },
    { id: 'workspace2', name: 'Workspace 2', letter: 'W2' }
  ]

  const handleWorkspaceClick = (workspaceId: string) => {
    chatState.selectedWorkspaceID.set(workspaceId)
    onPageChange('workspace')
  }

  return (
    <div className="flex flex-col items-center space-y-2 overflow-y-auto">
      {workspaces.map((workspace) => (
        <button
          key={workspace.id}
          className={twMerge(
            'flex h-12 w-12 items-center justify-center rounded-full transition-all',
            currentPage === 'workspace' && chatState.selectedWorkspaceID.value === workspace.id
              ? 'bg-[#5865F2] text-white'
              : 'bg-[#36393F] text-gray-300 hover:bg-[#5865F2] hover:text-white'
          )}
          onClick={() => handleWorkspaceClick(workspace.id)}
          title={workspace.name}
        >
          <span className="text-lg font-medium">{workspace.letter}</span>
        </button>
      ))}

      <button
        className={twMerge(
          'flex h-12 w-12 items-center justify-center rounded-full bg-[#36393F] text-[#3BA55C] transition-colors hover:bg-[#3BA55C] hover:text-white'
        )}
        title="Add a Workspace"
      >
        <span className="text-2xl">+</span>
      </button>
    </div>
  )
}
