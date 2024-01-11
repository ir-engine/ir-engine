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
import { MdDelete } from 'react-icons/md'

import { UserName } from '@etherealengine/common/src/schema.type.module'
import UserIcon from './assets/user.svg'

export const ViewMember = () => {
  const Members: { name: UserName }[] = [
    { name: 'John Laouireen' as UserName },
    { name: 'John Laouireen' as UserName },
    { name: 'John Laouireen' as UserName },
    { name: 'John Laouireen' as UserName },
    { name: 'John Laouireen' as UserName },
    { name: 'John Laouireen' as UserName }
  ]

  return (
    <div className="bg-[#15171B] text-white w-[380px] transform translate-x-0 transition-transform ease-in-out duration-[100]">
      <div className="w-[200px] justify-start mt-[45px] ml-9 gap-2  flex flex-wrap">
        <p className="text-[16px] font-bold text-white">GROUP TEST 1</p>
        <p className="text-[10px] font-bold text-[#83769C] mt-[5px]">12 Member (s)</p>
      </div>
      <div className="w-[380px] flex flex-wrap mt-9 gap-2 justify-center">
        {Members.map((item) => {
          return (
            <div className="rounded-[10px] bg-[#15171B] w-[350px] h-[45px] flex flex-wrap">
              <div className="rounded-full ml-4 my-2 bg-[#26282B] w-[30px] h-[30px] justify-between">
                <img className="max-w-full w-[13.64px] mx-2 h-[28.64px] overflow-hidden" alt="" src={UserIcon} />
              </div>
              <p className="text-[12px] w-[220px] ml-3 font-bold text-white mt-3.5">{item.name}</p>
              <div className="rounded-full  my-2 bg-[#26282B] w-[30px] h-[30px] justify-between">
                <button className="m-0 w-[40px] ">
                  <MdDelete className="w-[22px] h-[30px] mx-1 fill-[#DD3333] overflow-hidden" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
