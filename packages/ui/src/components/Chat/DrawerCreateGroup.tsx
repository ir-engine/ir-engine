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
import { IoMdAddCircle } from 'react-icons/io'

export const DrawerCreateGroup = () => {
  return (
    <div className="bg-[#15171B] text-white w-[380px] transform translate-x-0 transition-transform ease-in-out duration-[100]">
      <div className="w-[180px] justify-start mt-[45px] ml-9 gap-2  flex flex-wrap">
        <IoMdAddCircle className="w-[22px] fill-[#ffffff] h-[25px]" />
        <p className="text-[16px] font-bold text-white">CREATE GROUP</p>
      </div>
      <div className="w-[300px] ml-9 mt-[50px]">
        <p className="font-sans">Name:</p>
        <div className="mt-3 rounded-[5px] bg-[#d7d7d7] w-[300px] h-[42px] flex flex-wrap">
          <div className="w-[300px] h-[40px] mt-[1px] ml-[0.5px] mr-[0.5px]">
            <input
              type="text"
              className="rounded-[5px] focus:outline-none focus:border-[#15171B] border-[#15171B] border-2 text-[#ffff] bg-[#15171B] p-[9.5px] w-full "
              placeholder="Enter group name"
            />
          </div>
        </div>
      </div>
      <div className="w-[300px] ml-9 mt-8">
        <p className="font-sans">Description:</p>
        <div className="mt-3 rounded-[5px] bg-[#d7d7d7] w-[300px] h-[42px] flex flex-wrap">
          <div className="w-[300px] h-[35px] mt-[1px] ml-[0.5px] mr-[0.5px]">
            <input
              type="text"
              className="rounded-[5px] focus:outline-none focus:border-[#15171B] border-[#15171B] border-2 text-[#ffff] bg-[#15171B] p-[9.5px] w-full "
              placeholder="Enter description"
            />
          </div>
        </div>
      </div>
      <div className="w-[330px] flex justify-end mt-9 ml-2 items-center">
        <button className="cursor-pointer rounded-[20px] p-0 bg-[#3F3960] w-[120px] h-8">
          <div className="[text-align-last:center] rounded-2xl text-[16px] text-sm font-segoe-ui text-white text-left">
            Create Now
          </div>
        </button>
      </div>
    </div>
  )
}
