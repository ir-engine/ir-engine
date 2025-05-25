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
import { ChannelID, UserID } from '@ir-engine/common/src/schema.type.module'
import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'

export type ChatPageType = 'directMessages' | 'workspace' | 'contacts' | 'settings'

export interface WorkspaceChannel {
  id: string
  name: string
  description?: string
  unreadCount?: number
  isJoined?: boolean
  lastMessageTime?: number
}

export interface WorkspaceMember {
  id: UserID
  name: string
  status: 'online' | 'idle' | 'dnd' | 'offline'
  avatar?: string
}

export interface Workspace {
  id: string
  name: string
  description?: string
  avatar?: string
  memberCount: number
  channels: WorkspaceChannel[]
  members: WorkspaceMember[]
}

export const NewChatState = defineState({
  name: 'ir.ui.chat.NewChatState',
  initial: () => ({
    // Current active page in the chat UI
    currentPage: 'directMessages' as ChatPageType,

    // Selected channel ID (for messages)
    selectedChannelID: null as ChannelID | null,

    // Selected workspace ID
    selectedWorkspaceID: null as string | null,

    // Selected workspace channel ID
    selectedWorkspaceChannelID: null as string | null,

    // Workspaces data
    workspaces: {
      workspace1: {
        id: 'workspace1',
        name: 'Workspace 1',
        description: 'This is workspace 1',
        avatar: '',
        memberCount: 5,
        channels: [
          { id: 'general', name: 'general', unreadCount: 0, isJoined: true },
          { id: 'announcements', name: 'announcements', unreadCount: 2, isJoined: true },
          { id: 'meeting-room', name: 'meeting-room', unreadCount: 0, isJoined: true },
          { id: 'project-updates', name: 'project-updates', unreadCount: 5, isJoined: true }
        ],
        members: [
          { id: 'user1' as UserID, name: 'User 1', status: 'online' },
          { id: 'user2' as UserID, name: 'User 2', status: 'online' },
          { id: 'user3' as UserID, name: 'User 3', status: 'online' },
          { id: 'user4' as UserID, name: 'User 4', status: 'offline' },
          { id: 'user5' as UserID, name: 'User 5', status: 'offline' }
        ]
      },
      workspace2: {
        id: 'workspace2',
        name: 'Workspace 2',
        description: 'This is workspace 2',
        avatar: '',
        memberCount: 3,
        channels: [
          { id: 'general', name: 'general', unreadCount: 0, isJoined: true },
          { id: 'random', name: 'random', unreadCount: 0, isJoined: true }
        ],
        members: [
          { id: 'user1' as UserID, name: 'User 1', status: 'online' },
          { id: 'user2' as UserID, name: 'User 2', status: 'offline' },
          { id: 'user6' as UserID, name: 'User 6', status: 'online' }
        ]
      }
    } as Record<string, Workspace>,

    // UI state
    showMemberSidebar: true,
    showUserStatusPanel: true,
    showWorkspaceSettings: false,
    showChannelSettings: false,
    memberSearchQuery: ''
  }),
  extension: syncStateWithLocalStorage(['currentPage', 'selectedWorkspaceID', 'showMemberSidebar'])
})
