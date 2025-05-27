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

import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/hooks/useUserAvatarThumbnail'
import { ChannelService } from '@ir-engine/client-core/src/social/services/ChannelService'
import { ImmutableObject, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import React, { useRef } from 'react'
import { HiChat, HiPhone, HiSearch, HiUserRemove, HiX } from 'react-icons/hi'
import { NewChatState, Workspace, WorkspaceMember } from '../ChatState'

interface MemberSidebarProps {
  workspace: Workspace | ImmutableObject<Workspace>
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({ workspace }) => {
  const chatState = useMutableState(NewChatState)
  const searchQuery = useHookstate(chatState.memberSearchQuery)
  const contextMenu = useHookstate({
    visible: false,
    x: 0,
    y: 0,
    memberId: ''
  })
  const contextMenuRef = useRef<HTMLDivElement>(null)

  const filteredMembers = workspace.members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )

  const onlineMembers = filteredMembers.filter((member) => member.status === 'online')
  const offlineMembers = filteredMembers.filter((member) => member.status === 'offline')

  const handleContextMenu = (e: React.MouseEvent, memberId: string) => {
    e.preventDefault()
    contextMenu.merge({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      memberId
    })
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
      contextMenu.visible.set(false)
    }
  }

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleStartChat = (memberId: string) => {
    ChannelService.createChannel([memberId as any]).then((channel) => {
      if (channel) {
        chatState.selectedChannelID.set(channel.id)
        chatState.currentPage.set('directMessages')
      }
    })
    contextMenu.visible.set(false)
  }

  const handleStartCall = (memberId: string) => {
    ChannelService.createChannel([memberId as any]).then((channel) => {
      if (channel) {
        ChannelService.joinChannelInstance(channel.id)
        chatState.selectedChannelID.set(channel.id)
        chatState.currentPage.set('directMessages')
      }
    })
    contextMenu.visible.set(false)
  }

  return (
    <div className="flex h-full w-64 flex-col border-l border-gray-300 bg-[#F2F3F5]">
      <div className="border-b border-gray-300 p-4">
        <h2 className="text-lg font-bold text-[#3F3960]">Members</h2>
        <div className="mt-2 flex items-center rounded-md bg-white px-3 py-1.5">
          <HiSearch className="mr-2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            className="w-full bg-transparent text-sm focus:outline-none"
            placeholder="Search members..."
            value={searchQuery.value}
            onChange={(e) => searchQuery.set(e.target.value)}
          />
          {searchQuery.value && (
            <button
              className="text-gray-400 hover:text-gray-600"
              onClick={() => searchQuery.set('')}
              aria-label="Clear search"
            >
              <HiX className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {onlineMembers.length > 0 && (
          <div className="p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#787589]">ONLINE — {onlineMembers.length}</h3>
            <div className="space-y-3">
              {onlineMembers.map((member) => (
                <MemberItem key={member.id} member={member} onContextMenu={handleContextMenu} />
              ))}
            </div>
          </div>
        )}

        {offlineMembers.length > 0 && (
          <div className="border-t border-gray-300 p-4">
            <h3 className="mb-2 text-sm font-semibold text-[#787589]">OFFLINE — {offlineMembers.length}</h3>
            <div className="space-y-3">
              {offlineMembers.map((member) => (
                <MemberItem key={member.id} member={member} onContextMenu={handleContextMenu} />
              ))}
            </div>
          </div>
        )}
      </div>

      {contextMenu.visible.value && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
          style={{ top: `${contextMenu.y.value}px`, left: `${contextMenu.x.value}px` }}
        >
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => handleStartChat(contextMenu.memberId.value)}
          >
            <HiChat className="mr-2 h-4 w-4" />
            Message
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => handleStartCall(contextMenu.memberId.value)}
          >
            <HiPhone className="mr-2 h-4 w-4" />
            Call
          </button>
          <div className="my-1 border-t border-gray-100"></div>
          <button className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
            <HiUserRemove className="mr-2 h-4 w-4" />
            Remove from Workspace
          </button>
        </div>
      )}
    </div>
  )
}

interface MemberItemProps {
  member: WorkspaceMember
  onContextMenu: (e: React.MouseEvent, memberId: string) => void
}

const MemberItem: React.FC<MemberItemProps> = ({ member, onContextMenu }) => {
  const userThumbnail = useUserAvatarThumbnail(member.id)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-[#57C290]'
      case 'idle':
        return 'bg-[#FAA61A]'
      case 'dnd':
        return 'bg-[#ED4245]'
      default:
        return 'bg-[#747F8D]'
    }
  }

  return (
    <div
      className="flex cursor-pointer items-center rounded p-1 hover:bg-[#E3E5E8]"
      onContextMenu={(e) => onContextMenu(e, member.id)}
    >
      <div className="relative">
        {member.avatar || userThumbnail ? (
          <img
            src={member.avatar || userThumbnail}
            alt={`${member.name}'s avatar`}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
            {member.name.charAt(0)}
          </div>
        )}
        {member.status !== 'offline' && (
          <div
            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#F2F3F5] ${getStatusColor(
              member.status
            )}`}
          ></div>
        )}
      </div>
      <span className={`ml-2 text-[#3F3960] ${member.status === 'offline' ? 'opacity-60' : ''}`}>{member.name}</span>
    </div>
  )
}
