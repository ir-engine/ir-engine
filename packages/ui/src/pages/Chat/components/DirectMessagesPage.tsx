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
import { FriendService, FriendState } from '@ir-engine/client-core/src/social/services/FriendService'
import { UserID } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { NO_PROXY, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect } from 'react'
import { HiSearch, HiX } from 'react-icons/hi'
import { NewChatState } from '../ChatState'
import { ConversationList } from './ConversationList'
import { ConversationWindow } from './ConversationWindow'
import { UserStatusPanel } from './UserStatusPanel'

export const DirectMessagesPage: React.FC = () => {
  const chatState = useMutableState(NewChatState)
  const isNewMessageModalOpen = useHookstate(false)

  const handleNewMessageClick = () => {
    isNewMessageModalOpen.set(true)
  }

  return (
    <div className="relative flex h-full w-full">
      <ConversationList onNewMessage={handleNewMessageClick} />
      <ConversationWindow />
      {chatState.showUserStatusPanel.value && <UserStatusPanel />}

      {isNewMessageModalOpen.value && <NewMessageModal onClose={() => isNewMessageModalOpen.set(false)} />}
    </div>
  )
}

interface NewMessageModalProps {
  onClose: () => void
}

const NewMessageModal: React.FC<NewMessageModalProps> = ({ onClose }) => {
  const friendState = useMutableState(FriendState)
  const chatState = useMutableState(NewChatState)
  const searchQuery = useHookstate('')
  const selectedFriends = useHookstate<UserID[]>([])

  useEffect(() => {
    FriendService.getUserRelationship(Engine.instance.userID as UserID)
  }, [])

  const friends = friendState.relationships.value
    .filter((friend) => friend.userRelationshipType === 'friend')
    .map((friend) => {
      return {
        id: friend.relatedUserId,
        name: friend.relatedUser.name
      }
    })
    .filter((friend) => friend.name.toLowerCase().includes(searchQuery.value.toLowerCase()))

  const handleCreateConversation = () => {
    if (selectedFriends.length === 0) return

    ChannelService.createChannel(selectedFriends.get(NO_PROXY) as UserID[]).then((channelId) => {
      if (channelId) {
        chatState.selectedChannelID.set(channelId as any)
        onClose()
      }
    })
  }

  const toggleFriendSelection = (friendId: UserID) => {
    if (selectedFriends.value.includes(friendId)) {
      selectedFriends.set(selectedFriends.value.filter((id) => id !== friendId))
    } else {
      selectedFriends.merge([friendId])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="flex max-h-[600px] w-[500px] flex-col rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-bold text-[#3F3960]">New Message</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <HiX className="h-5 w-5" />
          </button>
        </div>
        <div className="border-b border-gray-200 p-4">
          <div className="mb-3 flex items-center">
            <span className="mr-2 text-sm font-medium text-[#3F3960]">To:</span>
            <div className="flex flex-wrap gap-2">
              {selectedFriends.value.map((friendId) => {
                const friend = friends.find((f) => f.id === friendId)
                if (!friend) return null

                return (
                  <div key={friendId} className="flex items-center rounded-full bg-[#E3E5E8] px-3 py-1">
                    <span className="text-sm text-[#3F3960]">{friend.name}</span>
                    <button
                      className="ml-2 text-gray-500 hover:text-gray-700"
                      onClick={() => toggleFriendSelection(friendId)}
                    >
                      <HiX className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Type a name or select from below"
              className="w-full rounded-md bg-[#E3E5E8] py-2 pl-8 pr-4 text-sm focus:outline-none"
              value={searchQuery.value}
              onChange={(e) => searchQuery.set(e.target.value)}
            />
            <HiSearch className="absolute left-2.5 top-2.5 text-gray-500" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {friends.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-gray-500">
              <p>No friends found</p>
              {searchQuery && <p className="text-sm">Try a different search</p>}
            </div>
          ) : (
            <div className="space-y-1">
              {friends.map((friend) => (
                <FriendItem
                  key={friend.id}
                  friend={friend}
                  isSelected={selectedFriends.value.includes(friend.id)}
                  onToggle={() => toggleFriendSelection(friend.id)}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end border-t border-gray-200 p-4">
          <button
            className="rounded-md bg-[#3F3960] px-4 py-2 text-white hover:bg-[#2D2A45] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={handleCreateConversation}
            disabled={selectedFriends.length === 0}
          >
            Create Conversation
          </button>
        </div>
      </div>
    </div>
  )
}

interface FriendItemProps {
  friend: {
    id: string
    name: string
  }
  isSelected: boolean
  onToggle: () => void
}

const FriendItem: React.FC<FriendItemProps> = ({ friend, isSelected, onToggle }) => {
  const userThumbnail = useUserAvatarThumbnail(friend.id as UserID)

  return (
    <div
      className={`flex cursor-pointer items-center rounded-md p-2 ${
        isSelected ? 'bg-[#E3E5E8]' : 'hover:bg-[#F2F3F5]'
      }`}
      onClick={onToggle}
    >
      <div className="flex flex-1 items-center">
        <img src={userThumbnail} alt={`${friend.name}'s avatar`} className="mr-3 h-8 w-8 rounded-full object-cover" />
        <span className="text-[#3F3960]">{friend.name}</span>
      </div>

      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#3F3960] ${
          isSelected ? 'bg-[#3F3960]' : 'bg-white'
        }`}
      >
        {isSelected && <div className="h-2 w-2 rounded-full bg-white"></div>}
      </div>
    </div>
  )
}
