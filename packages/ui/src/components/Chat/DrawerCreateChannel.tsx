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

import React, { useEffect } from 'react'
import { IoMdAddCircle } from 'react-icons/io'

import { ChannelService } from '@etherealengine/client-core/src/social/services/ChannelService'
import { FriendService, FriendState } from '@etherealengine/client-core/src/social/services/FriendService'
import { useUserAvatarThumbnail } from '@etherealengine/client-core/src/user/functions/useUserAvatarThumbnail'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import { NO_PROXY, getMutableState, useHookstate } from '@etherealengine/hyperflux'

export const DrawerCreateChannel = () => {
  const friendState = useHookstate(getMutableState(FriendState))

  useEffect(() => {
    FriendService.getUserRelationship(Engine.instance.userID)
  }, [])

  const selectedFriends = useHookstate<UserID[]>([])

  const friends = friendState.relationships.value
    .filter((friend) => friend.userRelationshipType === 'friend')
    .map((friend) => {
      return {
        id: friend.relatedUserId,
        name: friend.relatedUser.name
      }
    })

  const createChannel = () => {
    ChannelService.createChannel(selectedFriends.get(NO_PROXY))
  }

  const RenderUser = (props: { friend: (typeof friends)[number] }) => {
    const userThumbnail = useUserAvatarThumbnail(props.friend.id)
    return (
      <>
        <div
          className={`w-[320px] h-[68px] flex flex-wrap mx-4 gap-1 justify-center rounded-[5px] ${
            selectedFriends.value.includes(props.friend.id) ? 'bg-[#D4D7DC]' : ''
          }`}
          onClick={() => selectedFriends.merge([props.friend.id])}
        >
          <div className="w-[230px] flex flex-wrap gap-5 justify-start">
            <img className="max-w-full mt-3 rounded-8xs w-11 h-11 object-cover" alt="" src={userThumbnail} />
            <div className="mt-3 justify-start">
              <p className="font-bold text-[#3F3960]">{props.friend.name}</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="bg-[#15171B] text-white w-[380px] transform translate-x-0 transition-transform ease-in-out duration-[100]">
      <div className="w-[180px] justify-start mt-[45px] ml-9 gap-2  flex flex-wrap">
        <IoMdAddCircle className="w-[22px] fill-[#ffffff] h-[25px]" />
        <p className="text-[16px] font-bold text-white">CREATE CHANNEL</p>
      </div>
      {friends.map((friend, index) => (
        <RenderUser friend={friend} key={index} />
      ))}
      {selectedFriends.value && (
        <div className="w-[330px] flex justify-start ml-9 mt-9 items-center">
          <button className="m-0 cursor-pointer rounded-[20px] p-0 bg-[#3F3960] w-[120px] h-8" onClick={createChannel}>
            <div className="[text-align-last:center] rounded-2xl text-[16px] text-sm font-segoe-ui text-white text-left">
              Create Now
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
