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

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/hooks/useUserAvatarThumbnail'
import { ChannelService } from '@ir-engine/client-core/src/social/services/ChannelService'
import { FriendService, FriendState } from '@ir-engine/client-core/src/social/services/FriendService'
import { API } from '@ir-engine/common'
import { UserID, UserName, userPath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { HiChat, HiCheck, HiDotsVertical, HiPhone, HiSearch, HiUserAdd, HiUserRemove, HiX } from 'react-icons/hi'
import { NewChatState } from '../ChatState'

export const ContactsPage: React.FC = () => {
  const { t } = useTranslation()
  const friendState = useMutableState(FriendState)
  const chatState = useMutableState(NewChatState)
  const searchQuery = useHookstate('')
  const addFriendUsername = useHookstate('')
  const isAddingFriend = useHookstate(false)
  const userId = Engine.instance.userID as UserID
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const contextMenu = useHookstate({
    visible: false,
    x: 0,
    y: 0,
    contactId: ''
  })

  useEffect(() => {
    FriendService.getUserRelationship(userId)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        contextMenu.visible.set(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const friends = friendState.relationships.value
    .filter((friend) => friend.userRelationshipType === 'friend')
    .map((friend) => ({
      id: friend.relatedUserId,
      name: friend.relatedUser.name
    }))
    .filter((friend) => friend.name.toLowerCase().includes(searchQuery.value.toLowerCase()))

  const pendingRequests = friendState.relationships.value
    .filter((friend) => friend.userRelationshipType === 'requested')
    .map((friend) => ({
      id: friend.relatedUserId,
      name: friend.relatedUser.name
    }))

  const handleAddFriend = async () => {
    if (!addFriendUsername.value.trim()) return

    isAddingFriend.set(true)
    try {
      // Find user by username
      const users = await API.instance.service(userPath).find({
        query: {
          name: addFriendUsername.value.trim() as UserName,
          $limit: 1
        }
      })

      if (users.data && users.data.length > 0) {
        const targetUserId = users.data[0].id as UserID

        // Check if already friends or request pending
        const existingRelationship = friendState.relationships.value.find(
          (rel) => rel.relatedUserId === targetUserId || rel.userId === targetUserId
        )

        if (existingRelationship) {
          NotificationService.dispatchNotify(t('user:friends.alreadyFriendOrPending'), { variant: 'warning' })
        } else {
          await FriendService.requestFriend(userId, targetUserId)
          NotificationService.dispatchNotify(t('user:friends.requestSent'), { variant: 'success' })
          addFriendUsername.set('')
        }
      } else {
        NotificationService.dispatchNotify(t('user:friends.userNotFound'), { variant: 'error' })
      }
    } catch (error) {
      console.error('Error adding friend:', error)
      NotificationService.dispatchNotify(t('user:friends.errorAddingFriend'), { variant: 'error' })
    } finally {
      isAddingFriend.set(false)
    }
  }

  const handleOpenChat = (contactId: UserID) => {
    ChannelService.createChannel([contactId]).then((channel) => {
      if (channel) {
        chatState.selectedChannelID.set(channel.id)
        chatState.currentPage.set('directMessages')
      }
    })
  }

  const handleStartCall = (contactId: UserID) => {
    // Create or find existing channel with this user and start a call
    ChannelService.createChannel([contactId]).then((channel) => {
      if (channel) {
        ChannelService.joinChannelInstance(channel.id)
        chatState.selectedChannelID.set(channel.id)
        chatState.currentPage.set('directMessages')
      }
    })
  }

  const handleRemoveFriend = (contactId: UserID) => {
    FriendService.unfriend(userId, contactId)
    contextMenu.visible.set(false)
  }

  const handleContextMenu = (e: React.MouseEvent, contactId: string) => {
    e.preventDefault()
    contextMenu.merge({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      contactId
    })
  }

  const onlineFriends = friends
  const offlineFriends: typeof friends = []

  return (
    <div className="flex h-full w-full">
      <div className="flex h-full w-1/3 flex-col border-r border-gray-300 bg-[#F2F3F5]">
        <div className="border-b border-gray-300 p-4">
          <h2 className="text-lg font-bold text-[#3F3960]">Friend Requests</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {pendingRequests.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-gray-500">
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <RequestItem
                  key={request.id}
                  request={request}
                  onAccept={() => FriendService.acceptFriend(userId, request.id as UserID)}
                  onDecline={() => FriendService.declineFriend(userId, request.id as UserID)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-300 p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Add friend by username..."
              className="w-full rounded-md bg-[#E3E5E8] py-2 pl-4 pr-10 text-sm focus:outline-none"
              value={addFriendUsername.value}
              onChange={(e) => addFriendUsername.set(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFriend()}
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 transform text-[#3F3960]"
              onClick={handleAddFriend}
              disabled={isAddingFriend.value || !addFriendUsername.value.trim()}
            >
              <HiUserAdd className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-full w-1/3 flex-col border-r border-gray-300 bg-white">
        <div className="border-b border-gray-300 p-4">
          <h2 className="text-lg font-bold text-[#3F3960]">Contacts</h2>
          <div className="relative mt-2">
            <input
              type="text"
              placeholder="Search contacts..."
              className="w-full rounded-md bg-[#E3E5E8] py-2 pl-9 pr-4 text-sm focus:outline-none"
              value={searchQuery.value}
              onChange={(e) => searchQuery.set(e.target.value)}
            />
            <HiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-[#787589]" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {friends.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-gray-500">
              <p>No contacts yet</p>
              <p className="text-sm">Add friends to get started</p>
            </div>
          ) : (
            <div>
              {onlineFriends.length > 0 && (
                <>
                  <div className="border-b border-gray-200 p-3">
                    <h3 className="text-xs font-semibold text-[#787589]">ONLINE — {onlineFriends.length}</h3>
                  </div>
                  {onlineFriends.map((friend) => (
                    <ContactItem key={friend.id} contact={friend} onContextMenu={handleContextMenu} />
                  ))}
                </>
              )}

              {offlineFriends.length > 0 && (
                <>
                  <div className="border-b border-gray-200 p-3">
                    <h3 className="text-xs font-semibold text-[#787589]">OFFLINE — {offlineFriends.length}</h3>
                  </div>
                  {offlineFriends.map((friend) => (
                    <ContactItem key={friend.id} contact={friend} isOnline={false} onContextMenu={handleContextMenu} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex h-full w-1/3 flex-col bg-[#F2F3F5]">
        <div className="border-b border-gray-300 p-4">
          <h2 className="text-lg font-bold text-[#3F3960]">Activity</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <ActivityItem type="message" user="Alice" content="sent you a message" time="2 hours ago" />
            <ActivityItem type="friend" user="Bob" content="accepted your friend request" time="5 hours ago" />
            <ActivityItem type="call" user="Charlie" content="missed your call" time="Yesterday" />
          </div>
        </div>
      </div>

      {contextMenu.visible.value && (
        <div
          ref={contextMenuRef}
          className="absolute z-50 w-48 rounded-md bg-white py-1 shadow-lg"
          style={{ top: contextMenu.y.value, left: contextMenu.x.value }}
        >
          <button
            className="flex w-full items-center px-4 py-2 text-left hover:bg-[#F2F3F5]"
            onClick={() => {
              handleOpenChat(contextMenu.contactId.value as UserID)
              contextMenu.visible.set(false)
            }}
          >
            <HiChat className="mr-2" /> Message
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left hover:bg-[#F2F3F5]"
            onClick={() => {
              handleStartCall(contextMenu.contactId.value as UserID)
              contextMenu.visible.set(false)
            }}
          >
            <HiPhone className="mr-2" /> Call
          </button>
          <button
            className="flex w-full items-center px-4 py-2 text-left text-red-500 hover:bg-[#F2F3F5]"
            onClick={() => handleRemoveFriend(contextMenu.contactId.value as UserID)}
          >
            <HiUserRemove className="mr-2" /> Remove Friend
          </button>
        </div>
      )}
    </div>
  )
}

interface RequestItemProps {
  request: {
    id: string
    name: string
  }
  onAccept: () => void
  onDecline: () => void
}

const RequestItem: React.FC<RequestItemProps> = ({ request, onAccept, onDecline }) => {
  const userThumbnail = useUserAvatarThumbnail(request.id as UserID)

  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm">
      <div className="flex items-center">
        <img src={userThumbnail} alt="User avatar" className="h-10 w-10 rounded-full object-cover" />
        <div className="ml-3">
          <p className="font-medium text-[#3F3960]">{request.name}</p>
          <p className="text-xs text-[#787589]">Wants to add you as a friend</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button className="rounded-full bg-[#57C290] p-1.5 text-white hover:bg-[#45A97A]" onClick={onAccept}>
          <HiCheck className="h-5 w-5" />
        </button>
        <button className="rounded-full bg-[#F87171] p-1.5 text-white hover:bg-[#EF4444]" onClick={onDecline}>
          <HiX className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

interface ContactItemProps {
  contact: {
    id: string
    name: string
  }
  isOnline?: boolean
  onContextMenu: (e: React.MouseEvent, contactId: string) => void
}

const ContactItem: React.FC<ContactItemProps> = ({ contact, isOnline = true, onContextMenu }) => {
  const userThumbnail = useUserAvatarThumbnail(contact.id as UserID)

  return (
    <div
      className="flex cursor-pointer items-center justify-between p-3 hover:bg-[#F2F3F5]"
      onContextMenu={(e) => onContextMenu(e, contact.id)}
    >
      <div className="flex items-center">
        <div className="relative">
          <img src={userThumbnail} alt="User avatar" className="h-10 w-10 rounded-full object-cover" />
          {isOnline && (
            <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#57C290]"></div>
          )}
        </div>
        <div className="ml-3">
          <p className="font-medium text-[#3F3960]">{contact.name}</p>
          <p className="text-xs text-[#787589]">{isOnline ? 'Online' : 'Offline'}</p>
        </div>
      </div>
      <button
        className="text-[#787589] hover:text-[#3F3960]"
        onClick={(e) => {
          e.stopPropagation()
          onContextMenu(e, contact.id)
        }}
      >
        <HiDotsVertical className="h-5 w-5" />
      </button>
    </div>
  )
}

interface ActivityItemProps {
  type: 'message' | 'friend' | 'call'
  user: string
  content: string
  time: string
}

const ActivityItem: React.FC<ActivityItemProps> = ({ user, content, time }) => {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center">
        <div className="h-8 w-8 rounded-full bg-gray-300"></div>
        <div className="ml-3">
          <p className="font-medium text-[#3F3960]">{user}</p>
          <p className="text-xs text-[#787589]">{time}</p>
        </div>
      </div>
      <p className="text-sm text-[#3F3960]">{content}</p>
    </div>
  )
}
