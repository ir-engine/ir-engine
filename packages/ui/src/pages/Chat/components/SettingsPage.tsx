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

import { ModalState } from '@ir-engine/client-core/src/common/services/ModalState'
import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { useUserAvatarThumbnail } from '@ir-engine/client-core/src/hooks/useUserAvatarThumbnail'
import AvatarSelectMenu from '@ir-engine/client-core/src/user/menus/avatar/AvatarSelectMenu'
import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { AvatarService } from '@ir-engine/client-core/src/user/services/AvatarService'
import { UserID, UserName } from '@ir-engine/common/src/schema.type.module'
import { useHookstate, useMutableState } from '@ir-engine/hyperflux'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HiBell, HiCamera, HiCheck, HiColorSwatch, HiLockClosed, HiPencil, HiUser, HiVolumeUp } from 'react-icons/hi'

type SettingsCategory = 'account' | 'appearance' | 'notifications' | 'privacy' | 'audio'

export const SettingsPage: React.FC = () => {
  const activeCategory = useHookstate<SettingsCategory>('account')

  return (
    <div className="flex h-full w-full bg-white">
      <div className="flex h-full w-64 flex-col border-r border-gray-300 bg-[#F2F3F5]">
        <div className="border-b border-gray-300 p-4">
          <h2 className="text-lg font-bold text-[#3F3960]">Settings</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          <SettingsMenu
            activeCategory={activeCategory.value}
            onCategoryChange={(category) => activeCategory.set(category)}
          />
        </div>
      </div>

      <div className="h-full flex-1 overflow-y-auto">
        <SettingsContent category={activeCategory.value} />
      </div>
    </div>
  )
}

interface SettingsMenuProps {
  activeCategory: SettingsCategory
  onCategoryChange: (category: SettingsCategory) => void
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ activeCategory, onCategoryChange }) => {
  const categories = [
    { id: 'account', name: 'My Account', icon: <HiUser className="h-5 w-5" /> },
    { id: 'appearance', name: 'Appearance', icon: <HiColorSwatch className="h-5 w-5" /> },
    { id: 'notifications', name: 'Notifications', icon: <HiBell className="h-5 w-5" /> },
    { id: 'privacy', name: 'Privacy & Safety', icon: <HiLockClosed className="h-5 w-5" /> },
    { id: 'audio', name: 'Audio & Video', icon: <HiVolumeUp className="h-5 w-5" /> }
  ]

  return (
    <div className="py-2">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`flex w-full items-center p-3 text-left ${
            activeCategory === category.id
              ? 'bg-[#E3E5E8] text-[#3F3960]'
              : 'text-[#787589] hover:bg-[#E3E5E8] hover:text-[#3F3960]'
          }`}
          onClick={() => onCategoryChange(category.id as SettingsCategory)}
        >
          <span className="mr-3">{category.icon}</span>
          <span>{category.name}</span>
        </button>
      ))}
    </div>
  )
}

interface SettingsContentProps {
  category: SettingsCategory
}

const SettingsContent: React.FC<SettingsContentProps> = ({ category }) => {
  const { t } = useTranslation()
  const authState = useMutableState(AuthState)
  const selfUser = authState.user
  const userId = selfUser.id.value as UserID
  const userName = useHookstate(selfUser.name).value
  const userThumbnail = useUserAvatarThumbnail(userId)

  const editedUsername = useHookstate<string>(userName)
  const isEditingUsername = useHookstate(false)
  const isSaving = useHookstate(false)

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    editedUsername.set(e.target.value)
  }

  const handleSaveUsername = async () => {
    if (!editedUsername.value.trim() || editedUsername.value === userName) {
      isEditingUsername.set(false)
      editedUsername.set(userName)
      return
    }

    isSaving.set(true)
    try {
      await AvatarService.updateUsername(userId, editedUsername.value.trim() as UserName)
      NotificationService.dispatchNotify(t('user:usermenu.profile.usernameUpdated'), { variant: 'success' })
      isEditingUsername.set(false)
    } catch (error) {
      console.error('Error updating username:', error)
      NotificationService.dispatchNotify(t('user:usermenu.profile.errorUpdatingUsername'), { variant: 'error' })
    } finally {
      isSaving.set(false)
    }
  }

  const handleAvatarClick = () => {
    ModalState.openModal(<AvatarSelectMenu showBackButton={true} previewEnabled={true} />)
  }

  return (
    <div className="p-6">
      {category === 'account' && (
        <div>
          <h2 className="mb-6 text-xl font-bold text-[#3F3960]">My Account</h2>

          <div className="mb-6 rounded-lg bg-[#F2F3F5] p-4">
            <div className="flex items-start">
              <div className="relative">
                <img
                  src={userThumbnail}
                  alt="User avatar"
                  className="h-20 w-20 cursor-pointer rounded-full object-cover"
                  onClick={handleAvatarClick}
                />
                <button
                  className="absolute bottom-0 right-0 rounded-full bg-[#3F3960] p-1.5 text-white hover:bg-[#2D2A45]"
                  onClick={handleAvatarClick}
                >
                  <HiCamera className="h-4 w-4" />
                </button>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-[#3F3960]">{userName}</h3>
                <button
                  className="mt-2 rounded bg-[#3F3960] px-3 py-1 text-sm text-white hover:bg-[#2D2A45]"
                  onClick={handleAvatarClick}
                >
                  Change Avatar
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#3F3960]">Username</label>
              <div className="relative">
                <input
                  type="text"
                  value={isEditingUsername.value ? editedUsername.value : userName}
                  onChange={handleUsernameChange}
                  disabled={!isEditingUsername.value || isSaving.value}
                  className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#3F3960]"
                />
                {!isEditingUsername.value ? (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#3F3960]"
                    onClick={() => isEditingUsername.set(true)}
                  >
                    <HiPencil className="h-5 w-5" />
                  </button>
                ) : (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#3F3960]"
                    onClick={handleSaveUsername}
                    disabled={isSaving.value}
                  >
                    {isSaving.value ? '...' : <HiCheck className="h-5 w-5" />}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#3F3960]">Account Type</label>
              <input
                type="text"
                value={selfUser.isGuest.value ? 'Guest Account' : 'Registered Account'}
                disabled
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-2 focus:outline-none"
              />
              {selfUser.isGuest.value && (
                <p className="mt-1 text-sm text-gray-500">
                  To upgrade your account, connect an email or social login in the profile menu.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {category === 'appearance' && (
        <div>
          <h2 className="mb-6 text-xl font-bold text-[#3F3960]">Appearance</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium text-[#3F3960]">Theme</h3>
              <div className="flex space-x-4">
                <div className="rounded-md border-2 border-[#3F3960] p-1">
                  <div className="h-20 w-32 overflow-hidden rounded bg-white">
                    <div className="h-4 bg-[#F2F3F5]"></div>
                    <div className="p-2">
                      <div className="mb-1 h-2 w-16 rounded bg-[#E3E5E8]"></div>
                      <div className="h-2 w-20 rounded bg-[#E3E5E8]"></div>
                    </div>
                  </div>
                  <p className="mt-1 text-center text-sm">Light</p>
                </div>

                <div className="rounded-md border-2 border-transparent p-1">
                  <div className="h-20 w-32 overflow-hidden rounded bg-[#36393F]">
                    <div className="h-4 bg-[#2F3136]"></div>
                    <div className="p-2">
                      <div className="mb-1 h-2 w-16 rounded bg-[#40444B]"></div>
                      <div className="h-2 w-20 rounded bg-[#40444B]"></div>
                    </div>
                  </div>
                  <p className="mt-1 text-center text-sm">Dark</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-[#3F3960]">Message Display</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="message-display" className="mr-2" checked />
                  <span>Cozy - Modern, clean layout</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="message-display" className="mr-2" />
                  <span>Compact - Classic IRC-style layout</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {category === 'notifications' && (
        <div>
          <h2 className="mb-6 text-xl font-bold text-[#3F3960]">Notifications</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium text-[#3F3960]">Notification Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Enable Desktop Notifications</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" checked />
                    <div className="peer h-6 w-11 rounded-full bg-gray-400 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#3F3960] peer-checked:after:translate-x-5"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span>Enable Sound Notifications</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" checked />
                    <div className="peer h-6 w-11 rounded-full bg-gray-400 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#3F3960] peer-checked:after:translate-x-5"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span>Notify When Friends Come Online</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="peer h-6 w-11 rounded-full bg-gray-400 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#3F3960] peer-checked:after:translate-x-5"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {category === 'privacy' && (
        <div>
          <h2 className="mb-6 text-xl font-bold text-[#3F3960]">Privacy & Safety</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium text-[#3F3960]">Privacy Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Allow Direct Messages from Server Members</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" checked />
                    <div className="peer h-6 w-11 rounded-full bg-gray-400 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#3F3960] peer-checked:after:translate-x-5"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span>Show Current Activity</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input type="checkbox" className="peer sr-only" checked />
                    <div className="peer h-6 w-11 rounded-full bg-gray-400 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#3F3960] peer-checked:after:translate-x-5"></div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-[#3F3960]">Who Can Add You As A Friend</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="friend-requests" className="mr-2" checked />
                  <span>Everyone</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="friend-requests" className="mr-2" />
                  <span>Friends of Friends</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="friend-requests" className="mr-2" />
                  <span>Nobody</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {category === 'audio' && (
        <div>
          <h2 className="mb-6 text-xl font-bold text-[#3F3960]">Audio & Video</h2>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-medium text-[#3F3960]">Input Device</h3>
              <select className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#3F3960]">
                <option>Default Microphone</option>
                <option>Headset Microphone</option>
              </select>

              <div className="mt-3">
                <label className="mb-1 block text-sm">Input Volume</label>
                <input type="range" className="w-full" />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-[#3F3960]">Output Device</h3>
              <select className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#3F3960]">
                <option>Default Speakers</option>
                <option>Headset</option>
              </select>

              <div className="mt-3">
                <label className="mb-1 block text-sm">Output Volume</label>
                <input type="range" className="w-full" />
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-medium text-[#3F3960]">Video Settings</h3>
              <select className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-[#3F3960]">
                <option>Default Camera</option>
                <option>External Webcam</option>
              </select>

              <div className="mt-3 flex h-40 items-center justify-center rounded-md bg-gray-200">
                <p className="text-gray-500">Camera preview</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
