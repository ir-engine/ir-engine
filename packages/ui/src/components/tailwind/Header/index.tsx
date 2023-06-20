/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { EllipsisHorizontalIcon, UserCircleIcon } from '@heroicons/react/20/solid'
import React from 'react'

import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

// import ThemeSwitcher from '@etherealengine/ui/src/components/tailwind/ThemeSwitcher'

const Header = () => {
  const authState = useHookstate(getMutableState(AuthState))
  const { user } = authState
  const avatarDetails = user?.avatar?.value
  return (
    <nav className="w-full navbar">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">Ethereal Capture</a>
      </div>
      <div className="navbar-end">
        {/* <label htmlFor="capture-drawer" className="btn btn-square btn-ghost drawer-button">
          <EllipsisHorizontalIcon className="w-6 h-6" />
        </label>
        <ThemeSwitcher /> */}
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost rounded-btn">
            <span className="mr-1">{user?.name?.value}</span>
            <div className="avatar">
              <div className="w-8 rounded-full">
                {avatarDetails.thumbnailResource?.url ? (
                  <img src={avatarDetails.thumbnailResource?.url} className="w-auto h-8" />
                ) : (
                  <UserCircleIcon className="w-8 h-8" />
                )}
              </div>
            </div>
          </label>
          <ul tabIndex={0} className="menu dropdown-content p-2 shadow bg-base-100 rounded-box w-52 mt-4">
            <li>
              <a href="/" target="_blank">
                Sign in
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

Header.displayName = 'Header'

Header.defaultProps = {}

export default Header
