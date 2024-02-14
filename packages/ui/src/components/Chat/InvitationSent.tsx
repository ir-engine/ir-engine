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

import React from 'react'

import { UserName } from '@etherealengine/common/src/schema.type.module'
import UserIcon from './assets/user.svg'

export const InvitationSent = () => {
  const InviteSent: { name: UserName; date: string }[] = [
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' },
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' },
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' },
    { name: 'John Laouireen' as UserName, date: '12 Aug 2021' }
  ]
  return (
    <div className="h-[86%] w-[460px] bg-[#15171B]">
      <div className="mt-2 flex flex-wrap gap-1">
        {InviteSent.map((item) => {
          return (
            <div className="ml-4 mt-1 flex h-[45px] w-[450px] flex-wrap rounded-[10px] bg-[#15171B]">
              <div className="my-2 ml-4 h-[30px] w-[30px] justify-between rounded-full bg-[#26282B]">
                <img className="mx-2 h-[28.64px] w-[13.64px] max-w-full overflow-hidden" alt="" src={UserIcon} />
              </div>
              <div className="ml-1 justify-items-start">
                <p className="mt-[9px] w-[120px] justify-items-start text-[12px] font-bold text-white">{item.name}</p>
                <p className="w-[80px] justify-items-start text-[8px] font-normal text-white">{item.date}</p>
              </div>
              <div className="ml-[144px] mt-2 flex flex-wrap gap-3">
                <button className="m-0 h-7 w-[98px] cursor-pointer rounded-[20px] bg-[#3C3230] p-0">
                  <div className="font-segoe-ui rounded-2xl text-left text-[11px] text-sm text-[#DD3333] [text-align-last:center]">
                    UNINVITE
                  </div>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
