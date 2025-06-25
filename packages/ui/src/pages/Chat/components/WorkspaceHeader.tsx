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
import React, { useRef, useState } from 'react'
import { HiCog, HiDotsVertical, HiUserGroup, HiX } from 'react-icons/hi'
import { NewChatState, Workspace } from '../ChatState'

interface WorkspaceHeaderProps {
  workspace: Workspace | ImmutableObject<Workspace>
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({ workspace }) => {
  const chatState = useMutableState(NewChatState)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const toggleMenu = () => {
    setShowMenu(!showMenu)
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setShowMenu(false)
    }
  }

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleOpenSettings = () => {
    chatState.showWorkspaceSettings.set(true)
    setShowMenu(false)
  }

  return (
    <div className="flex items-center justify-between border-b border-gray-300 p-4">
      <div className="flex items-center">
        {workspace.avatar ? (
          <img
            src={workspace.avatar}
            alt={`${workspace.name} avatar`}
            className="mr-3 h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#3F3960] text-white">
            {workspace.name.charAt(0)}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-[#3F3960]">{workspace.name}</h2>
          <div className="flex items-center text-xs text-[#787589]">
            <HiUserGroup className="mr-1 h-3 w-3" />
            <span>{workspace.memberCount} members</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#E3E5E8]"
          onClick={toggleMenu}
          aria-label="Workspace settings"
        >
          <HiDotsVertical className="h-5 w-5 text-[#3F3960]" />
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-0 top-10 z-10 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5"
          >
            <button
              className="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              onClick={handleOpenSettings}
            >
              <HiCog className="mr-2 h-4 w-4" />
              Workspace Settings
            </button>
          </div>
        )}
      </div>

      {chatState.showWorkspaceSettings.value && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-[#3F3960]">Workspace Settings</h3>
              <button
                className="rounded-full p-1 hover:bg-gray-200"
                onClick={() => chatState.showWorkspaceSettings.set(false)}
              >
                <HiX className="h-5 w-5 text-[#3F3960]" />
              </button>
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-[#3F3960]">Workspace Name</label>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 p-2 focus:border-[#3F3960] focus:outline-none"
                defaultValue={workspace.name}
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-[#3F3960]">Description</label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-2 focus:border-[#3F3960] focus:outline-none"
                rows={3}
                defaultValue={workspace.description}
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-[#3F3960]">Workspace Avatar</label>
              <div className="flex items-center">
                {workspace.avatar ? (
                  <img
                    src={workspace.avatar}
                    alt="Workspace avatar"
                    className="mr-3 h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#3F3960] text-white">
                    {workspace.name.charAt(0)}
                  </div>
                )}
                <button className="rounded-md bg-[#3F3960] px-3 py-1 text-sm text-white hover:bg-[#2D2A45]">
                  Change
                </button>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100"
                onClick={() => chatState.showWorkspaceSettings.set(false)}
              >
                Cancel
              </button>
              <button
                className="rounded-md bg-[#3F3960] px-4 py-2 text-sm text-white hover:bg-[#2D2A45]"
                onClick={() => chatState.showWorkspaceSettings.set(false)}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
