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

import React, { useEffect, useRef, useState } from 'react'

import { useUserAvatarThumbnail } from '@etherealengine/client-core/src/user/functions/useUserAvatarThumbnail'
import { AuthState } from '@etherealengine/client-core/src/user/services/AuthService'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { Resizable } from 're-resizable'
import { ChannelsList } from './ChannelsList'
import NotificationIcon from './assets/attach-file2.svg'
import BoxSearch from './assets/bxbxsearchalt2.svg'
import AddSquare from './assets/fluentaddsquare24filled.svg'
import SettingIcon from './assets/setting.svg'

/**
 * Chat
 */
export const ChatSection = () => {
  const userName = useHookstate(getMutableState(AuthState).user.name).value

  const userThumbnail = useUserAvatarThumbnail(Engine.instance.userID)

  const [checked, setChecked] = useState<boolean>(false)

  const handleToggle = () => {
    setChecked(!checked)
  }

  const [isToggleOn, setIsToggleOn] = useState<boolean>(false)

  const switchToggle = () => {
    setIsToggleOn(!isToggleOn)
  }

  const [isModalOpen, setIsModalOpen] = useState<number | null>(null)
  const openModal = (modalId: number) => {
    setIsModalOpen(modalId)
  }

  const closeModal = () => {
    setIsModalOpen(null)
  }

  const modalRef = useRef<HTMLDivElement | null>(null)
  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal()
    }
  }

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    } else {
      document.removeEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isModalOpen])

  return (
    <>
      <Resizable
        bounds="window"
        defaultSize={{ width: 385, height: '100%' }}
        enable={{
          top: false,
          right: true,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        minWidth={280}
        maxWidth={385}
      >
        <div className="h-[100vh] [background:linear-gradient(180deg,_#e3e5e8,_#f2f3f5_6.7%,_#f2f3f5_94.1%,_#e3e5e8)]">
          <div className="mx-2 flex h-[90px] flex-wrap justify-center gap-[92px]">
            <div className="mt-6">
              <b className="text-3xl">Chats</b>
            </div>
            <div className="flex justify-center gap-2">
              <button className="m-0">
                <img className="h-6 w-6 max-w-full overflow-hidden" alt="" src={NotificationIcon} />
              </button>
              <button className="m-0">
                <img className="h-6 w-6 max-w-full overflow-hidden" alt="" src={BoxSearch} />
              </button>
              <button onClick={() => openModal(1)}>
                <img className="h-6 w-6 overflow-hidden" alt="" src={AddSquare} />
                {/* {isModalOpen === 1 && (
                  <div
                    ref={modalRef}
                    className="fixed h-[100vh] inset-0 flex bg-black  items-center justify-center bg-opacity-50"
                    style={{ zIndex: '1' }}
                  >
                    <Create /> 
                  </div>
                )}*/}
              </button>
            </div>
          </div>
          <div className="box-border border-t-[1px] border-solid border-[#D1D3D7]" />
          <div className="hide-scroll mb-[90px] h-[77.5vh] w-full justify-center overflow-scroll">
            <ChannelsList />
          </div>
          <div className="absolute bottom-0 flex h-[75px] w-full flex-wrap justify-center gap-4 bg-[#ECECEC]">
            <img className="mt-3 h-11 w-11 max-w-full rounded-[38px] object-cover" alt="" src={userThumbnail} />
            <div className="mt-3">
              <p className="font-bold text-[#3F3960]">{userName}</p>
              <div className="flex flex-wrap gap-1">
                <div
                  className={`${isToggleOn ? 'bg-[#57C290]' : 'bg-[#b3b5b9]'} mt-[4.2px] h-2.5 w-2.5 rounded-[50%]`}
                />
                <p className="h-4 text-xs text-[#787589]">Active now</p>
              </div>
            </div>
            <label className="mt-[24px] cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="m-0 hidden"
                  checked={checked}
                  onChange={handleToggle}
                  onClick={switchToggle}
                />
                <div
                  className={`toggle__line h-5 w-10  rounded-full shadow-inner ${
                    checked ? 'bg-[#3F3960]' : 'bg-gray-400'
                  }`}
                ></div>
                <div
                  className={`toggle__dot absolute inset-x-[2px] inset-y-[2px] h-4 w-4 rounded-full bg-white shadow ${
                    checked ? 'translate-x-5' : ''
                  }`}
                ></div>
              </div>
            </label>
            <button className="m-0">
              <img className="h-6 w-6 max-w-full overflow-hidden" alt="" src={SettingIcon} />
            </button>
          </div>
        </div>
      </Resizable>
    </>
  )
}
