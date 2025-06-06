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

import { ImmutableObject, useMutableState } from '@ir-engine/hyperflux'
import React, { useState } from 'react'
import { HiCog, HiPhone, HiPlus, HiX } from 'react-icons/hi'
import { twMerge } from 'tailwind-merge'
import { NewChatState, Workspace, WorkspaceChannel } from '../ChatState'

interface ChannelSidebarProps {
  workspace: Workspace | ImmutableObject<Workspace>
}

export const ChannelSidebar: React.FC<ChannelSidebarProps> = ({ workspace }) => {
  const chatState = useMutableState(NewChatState)
  const [showCreateChannel, setShowCreateChannel] = useState(false)
  const [newChannelName, setNewChannelName] = useState('')
  const [newChannelDescription, setNewChannelDescription] = useState('')

  const handleChannelSelect = (channelId: string) => {
    chatState.selectedWorkspaceChannelID.set(channelId)
  }

  const handleCreateChannel = () => {
    if (newChannelName.trim()) {
      const newChannel: WorkspaceChannel = {
        id: `${newChannelName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name: newChannelName.trim(),
        description: newChannelDescription.trim() || undefined,
        unreadCount: 0,
        isJoined: true
      }

      const workspaceId = chatState.selectedWorkspaceID.value
      if (workspaceId) {
        const updatedChannels = [...workspace.channels, newChannel]
        chatState.workspaces[workspaceId].channels.set(updatedChannels)
      }
      setNewChannelName('')
      setNewChannelDescription('')
      setShowCreateChannel(false)
    }
  }

  const handleChannelSettings = (channelId: string) => {
    chatState.selectedWorkspaceChannelID.set(channelId)
    chatState.showChannelSettings.set(true)
  }

  const handleJoinLeaveChannel = (channel: WorkspaceChannel) => {
    const workspaceId = chatState.selectedWorkspaceID.value
    if (workspaceId) {
      const updatedChannels = workspace.channels.map((c) => {
        if (c.id === channel.id) {
          return { ...c, isJoined: !c.isJoined }
        }
        return c
      })
      chatState.workspaces[workspaceId].channels.set(updatedChannels)
    }
  }

  return (
    <div className="border-b border-gray-300 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#787589]">CHANNELS</h3>
        <button
          className="flex h-5 w-5 items-center justify-center rounded-full bg-[#3F3960] text-white hover:bg-[#2D2A45]"
          title="Add Channel"
          onClick={() => setShowCreateChannel(true)}
        >
          <HiPlus className="h-3 w-3" />
        </button>
      </div>
      <div className="space-y-1">
        {workspace.channels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isSelected={chatState.selectedWorkspaceChannelID.value === channel.id}
            onSelect={handleChannelSelect}
            onSettings={() => handleChannelSettings(channel.id)}
            onJoinLeave={() => handleJoinLeaveChannel(channel)}
          />
        ))}
      </div>

      {showCreateChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-[#3F3960]">Create Channel</h3>
              <button className="rounded-full p-1 hover:bg-gray-200" onClick={() => setShowCreateChannel(false)}>
                <HiX className="h-5 w-5 text-[#3F3960]" />
              </button>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-[#3F3960]">Channel Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 p-2 focus:border-[#3F3960] focus:outline-none"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g. general"
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-[#3F3960]">Description (optional)</label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-2 focus:border-[#3F3960] focus:outline-none"
                rows={3}
                value={newChannelDescription}
                onChange={(e) => setNewChannelDescription(e.target.value)}
                placeholder="What is this channel about?"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => setShowCreateChannel(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-[#3F3960] px-4 py-2 text-sm text-white hover:bg-[#2D2A45]"
                onClick={handleCreateChannel}
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {chatState.showChannelSettings.value && (
        <ChannelSettingsModal
          workspace={workspace as Workspace}
          channelId={chatState.selectedWorkspaceChannelID.value || ''}
          onClose={() => chatState.showChannelSettings.set(false)}
        />
      )}
    </div>
  )
}

interface ChannelItemProps {
  channel: WorkspaceChannel
  isSelected: boolean
  onSelect: (channelId: string) => void
  onSettings: () => void
  onJoinLeave: () => void
}

const ChannelItem: React.FC<ChannelItemProps> = ({ channel, isSelected, onSelect, onSettings, onJoinLeave }) => {
  const [showActions, setShowActions] = useState(false)

  return (
    <div
      className={twMerge(
        'group flex cursor-pointer items-center justify-between rounded p-2 hover:bg-[#E3E5E8]',
        isSelected ? 'bg-[#D4D7DC]' : ''
      )}
      onClick={() => channel.isJoined && onSelect(channel.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-center">
        <span className={twMerge('text-[#3F3960]', !channel.isJoined && 'opacity-50')}>
          # {channel.name}
          {channel.unreadCount ? (
            <span className="ml-2 rounded-full bg-[#3F3960] px-1.5 py-0.5 text-xs text-white">
              {channel.unreadCount}
            </span>
          ) : null}
        </span>
      </div>
      {showActions && (
        <div className="flex space-x-1">
          {channel.isJoined && (
            <>
              <button
                className="rounded-full p-1 hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation()
                  onSettings()
                }}
              >
                <HiCog className="h-4 w-4 text-[#3F3960]" />
              </button>
              <button
                className="rounded-full p-1 hover:bg-gray-200"
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <HiPhone className="h-4 w-4 text-[#3F3960]" />
              </button>
            </>
          )}
          <button
            className="rounded-full p-1 hover:bg-gray-200"
            onClick={(e) => {
              e.stopPropagation()
              onJoinLeave()
            }}
          >
            {channel.isJoined ? (
              <HiX className="h-4 w-4 text-[#3F3960]" />
            ) : (
              <HiPlus className="h-4 w-4 text-[#3F3960]" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}

interface ChannelSettingsModalProps {
  workspace: Workspace
  channelId: string
  onClose: () => void
}

const ChannelSettingsModal: React.FC<ChannelSettingsModalProps> = ({ workspace, channelId, onClose }) => {
  const chatState = useMutableState(NewChatState)
  const channel = workspace.channels.find((c) => c.id === channelId)

  if (!channel) return null

  const [channelName, setChannelName] = useState(channel.name)
  const [channelDescription, setChannelDescription] = useState(channel.description || '')

  const handleSaveSettings = () => {
    if (channelName.trim()) {
      const workspaceId = chatState.selectedWorkspaceID.value
      if (workspaceId) {
        const updatedChannels = workspace.channels.map((c) => {
          if (c.id === channelId) {
            return {
              ...c,
              name: channelName.trim(),
              description: channelDescription.trim() || undefined
            }
          }
          return c
        })
        chatState.workspaces[workspaceId].channels.set(updatedChannels)
      }
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-[#3F3960]">Channel Settings</h3>
          <button className="rounded-full p-1 hover:bg-gray-200" onClick={onClose}>
            <HiX className="h-5 w-5 text-[#3F3960]" />
          </button>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-[#3F3960]">Channel Name</label>
          <input
            type="text"
            className="w-full rounded-md border border-gray-300 p-2 focus:border-[#3F3960] focus:outline-none"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-[#3F3960]">Description</label>
          <textarea
            className="w-full rounded-md border border-gray-300 p-2 focus:border-[#3F3960] focus:outline-none"
            rows={3}
            value={channelDescription}
            onChange={(e) => setChannelDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rounded-md bg-[#3F3960] px-4 py-2 text-sm text-white hover:bg-[#2D2A45]"
            onClick={handleSaveSettings}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
