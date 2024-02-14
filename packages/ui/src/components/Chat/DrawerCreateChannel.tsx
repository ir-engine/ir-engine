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
import { UserID } from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs/src/Engine'
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
          className={`mx-4 flex h-[68px] w-[320px] flex-wrap justify-center gap-1 rounded-[5px] ${
            selectedFriends.value.includes(props.friend.id) ? 'bg-[#D4D7DC]' : ''
          }`}
          onClick={() => selectedFriends.merge([props.friend.id])}
        >
          <div className="flex w-[230px] flex-wrap justify-start gap-5">
            <img className="rounded-8xs mt-3 h-11 w-11 max-w-full object-cover" alt="" src={userThumbnail} />
            <div className="mt-3 justify-start">
              <p className="font-bold text-[#3F3960]">{props.friend.name}</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="w-[380px] translate-x-0 transform bg-[#15171B] text-white transition-transform duration-[100] ease-in-out">
      <div className="ml-9 mt-[45px] flex w-[180px] flex-wrap  justify-start gap-2">
        <IoMdAddCircle className="h-[25px] w-[22px] fill-[#ffffff]" />
        <p className="text-[16px] font-bold text-white">CREATE CHANNEL</p>
      </div>
      {friends.map((friend, index) => (
        <RenderUser friend={friend} key={index} />
      ))}
      {selectedFriends.value && (
        <div className="ml-9 mt-9 flex w-[330px] items-center justify-start">
          <button className="m-0 h-8 w-[120px] cursor-pointer rounded-[20px] bg-[#3F3960] p-0" onClick={createChannel}>
            <div className="font-segoe-ui rounded-2xl text-left text-[16px] text-sm text-white [text-align-last:center]">
              Create Now
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
