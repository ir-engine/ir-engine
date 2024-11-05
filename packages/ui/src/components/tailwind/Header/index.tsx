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

import React from 'react'
import { HiUserCircle } from 'react-icons/hi2'

import { AuthState } from '@ir-engine/client-core/src/user/services/AuthService'
import { State, useMutableState } from '@ir-engine/hyperflux'

import { useFind } from '@ir-engine/common'
import { userAvatarPath } from '@ir-engine/common/src/schema.type.module'
import Button from '../../../primitives/tailwind/Button'

const Header = (props: { mode: State<'playback' | 'capture'> }) => {
  const authState = useMutableState(AuthState)
  const { user } = authState
  const avatar = useFind(userAvatarPath, {
    query: {
      userId: user?.id?.value
    }
  })
  return (
    <nav className="navbar relative w-full">
      <label tabIndex={0} className="absolute right-0 top-0">
        <span className="mr-1">{user?.name?.value}</span>
        <div className="avatar">
          <div className="h-[60px] w-auto rounded-full">
            {avatar.data[0].avatar.thumbnailResource?.url ? (
              <img
                src={avatar.data[0].avatar.thumbnailResource?.url}
                crossOrigin="anonymous"
                className="h-[60px] w-auto rounded-full"
              />
            ) : (
              <HiUserCircle />
            )}
          </div>
        </div>
      </label>
      <div className="flex-1">
        <a className="text-xl normal-case">Ethereal Capture</a>
      </div>
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <Button
            className="font=[lato] pointer-events-auto m-2 h-[30px] w-[200px] rounded-full bg-[#292D3E] text-center text-sm font-bold shadow-md"
            title={'capture/playback'}
            onClick={() => props.mode.set(props.mode.value === 'playback' ? 'capture' : 'playback')}
          >
            <a className="text-l normal-case">
              {props.mode.value === 'playback' ? 'Switch to capture mode' : 'Switch to playback mode'}
            </a>
          </Button>
        </div>
      </div>
    </nav>
  )
}

Header.displayName = 'Header'

Header.defaultProps = {
  mode: { value: 'capture', set: () => {} } as any as State<'playback' | 'capture'>
}

export default Header
