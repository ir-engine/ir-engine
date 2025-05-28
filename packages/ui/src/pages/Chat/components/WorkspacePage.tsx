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
import React, { useEffect } from 'react'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import { NewChatState } from '../ChatState'
import { ChannelSidebar } from './ChannelSidebar'
import { ConversationWindow } from './ConversationWindow'
import { MemberSidebar } from './MemberSidebar'
import { WorkspaceHeader } from './WorkspaceHeader'

export const WorkspacePage: React.FC = () => {
  const chatState = useMutableState(NewChatState)
  const workspaceId = chatState.selectedWorkspaceID.value || 'workspace1'

  const workspaceState = chatState.workspaces[workspaceId]

  useEffect(() => {
    if (!chatState.selectedWorkspaceChannelID.value && workspaceState.channels.value.length > 0) {
      const firstChannelId = workspaceState.channels.value[0].id
      chatState.selectedWorkspaceChannelID.set(firstChannelId)
    }
  }, [workspaceState.channels])

  const toggleMemberSidebar = () => {
    chatState.showMemberSidebar.set(!chatState.showMemberSidebar.value)
  }

  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-64 flex-col border-r border-gray-300 bg-[#F2F3F5]">
        <WorkspaceHeader workspace={workspaceState.value} />
        <ChannelSidebar workspace={workspaceState.value} />
      </div>

      <div className="relative flex-1">
        <ConversationWindow />
        <button
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#E3E5E8] hover:bg-[#D4D7DC]"
          onClick={toggleMemberSidebar}
          title={chatState.showMemberSidebar.value ? 'Hide member list' : 'Show member list'}
        >
          {chatState.showMemberSidebar.value ? (
            <HiEyeOff className="h-5 w-5 text-[#3F3960]" />
          ) : (
            <HiEye className="h-5 w-5 text-[#3F3960]" />
          )}
        </button>
      </div>

      {chatState.showMemberSidebar.value && <MemberSidebar workspace={workspaceState.value} />}
    </div>
  )
}
