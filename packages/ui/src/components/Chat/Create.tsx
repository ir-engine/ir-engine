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

import React, { useState } from 'react'
import { BsPersonCircle } from 'react-icons/bs'
import { IoMdAddCircle } from 'react-icons/io'
import { MdEmail, MdPhoneIphone } from 'react-icons/md'

import FriendIcon from './assets/Friend'
import GroupIcon from './assets/Group'
import PartyIcon from './assets/Party'

export const Create = () => {
  const [activeButton, setActiveButton] = useState<number>(1)

  const handleButtonClick = (buttonId: number) => {
    setActiveButton(buttonId)
  }

  const [activeSideButton, setActiveSideButton] = useState<number>(1)

  const handleSideButtonClick = (ButtonId: number) => {
    setActiveSideButton(ButtonId)
  }

  return (
    <div className="w-[520px] h-[70%] absolute flex-1 bg-[#15171B] flex flex-wrap">
      <div className="w-full h-[14%] bg-[#15171B] flex flex-wrap">
        <div className="w-[180px] justify-start mt-[26px] ml-7 gap-2  flex flex-wrap">
          <IoMdAddCircle className="w-[22px] fill-[#ffffff] h-[25px]" />
          <p className="text-[16px] font-bold text-white">CREATE</p>
        </div>
      </div>
      <div className="box-border w-[370px] border-t-[1px] border-solid  ml-[150px] border-[#f6f7f8]" />

      <div className="w-full h-[86%] grid grid-cols-2 divide-x-0 bg-[#f6f7f8]">
        <div className="w-[150px] h-[100%] bg-[#15171B]">
          <div
            className={`w-[120px] justify-start ml-7 gap-2  flex flex-wrap mt-7 ${
              activeSideButton === 1 ? 'text-[#935CFF]' : 'text-[#ffffff]'
            }`}
            onClick={() => handleSideButtonClick(1)}
          >
            <FriendIcon color={activeSideButton === 1 ? '#935CFF' : '#ffffff'} />
            <p className="text-[16px] font-bold mt-2">FRIENDS</p>
          </div>
          <div
            className={`w-[120px] justify-start ml-7 gap-2  flex flex-wrap mt-6 ${
              activeSideButton === 2 ? 'text-[#935CFF]' : 'text-[#ffffff]'
            }`}
            onClick={() => handleSideButtonClick(2)}
          >
            <PartyIcon color={activeSideButton === 2 ? '#935CFF' : '#ffffff'} />
            <p className="text-[16px] font-bold mt-2.5">PARTY</p>
          </div>
          <div
            className={`w-[120px] justify-start ml-7 gap-2  flex flex-wrap mt-6 ${
              activeSideButton === 3 ? 'text-[#935CFF]' : 'text-[#ffffff]'
            }`}
            onClick={() => handleSideButtonClick(3)}
          >
            <GroupIcon color={activeSideButton === 3 ? '#935CFF' : '#ffffff'} />
            <p className="text-[16px] font-bold mt-2.5">GROUP</p>
          </div>
        </div>
        <div className="w-[368px] h-[100%] bg-[#15171B] ml-[-108px]">
          <div className="w-[350px] flex flex-wrap justify-start ml-5 mt-4 my-4 gap-[9px] ">
            <button
              className={`m-0 cursor-pointer rounded-[20px] border-dashed box-border border-[1px] p-0 w-[87px] h-6 ${
                activeButton === 1 ? 'bg-[#935CFF] text-white border-[#935CFF]' : 'text-[#A0A0B2] border-[#595C60]'
              }`}
              onClick={() => handleButtonClick(1)}
            >
              <div className="w-[180px] justify-start  gap-2 ml-2 flex flex-wrap">
                <MdEmail className="w-[20px] fill-[#ffffff] h-[22px]" />
                <p className="text-[16px] font-normal text-white">Email</p>
              </div>
            </button>
            <button
              className={`m-0 cursor-pointer rounded-[20px] border-dashed box-border border-[1px] p-0 w-[86px] h-6 ${
                activeButton === 2 ? 'bg-[#935CFF] text-white border-[#935CFF]' : 'text-[#A0A0B2] border-[#595C60]'
              }`}
              onClick={() => handleButtonClick(2)}
            >
              <div className="w-[180px] justify-start  gap-1 ml-2 flex flex-wrap">
                <MdPhoneIphone className="w-[20px] fill-[#ffffff] h-[15px] mt-[3px]" />
                <p className="text-[15px] font-normal text-white">Phone</p>
              </div>
            </button>
            <button
              className={`m-0 cursor-pointer rounded-[20px] border-dashed box-border border-[1px] p-0 w-[111px] h-6 ${
                activeButton === 3 ? 'bg-[#935CFF] text-white border-[#935CFF]' : 'text-[#A0A0B2] border-[#595C60]'
              }`}
              onClick={() => handleButtonClick(3)}
            >
              <div className="w-[180px] justify-start  gap-2 ml-2 flex flex-wrap">
                <BsPersonCircle className="w-[15px] fill-[#ffff] h-[20px]" />
                <p className="text-[14px] font-normal text-white">Invite Code</p>
              </div>
            </button>
            <div className="w-[340px] h-[50vh]">
              <div className="w-[40px] mt-8">
                <p className="font-sans text-white">Email:</p>
                <div className="mt-3 rounded-[5px] bg-[#d7d7d7] w-[306px] h-[45px] flex flex-wrap">
                  <div className="w-[305px] h-[40px] mt-[2px] ml-[0.5px] mr-[0.5px]">
                    <input
                      type="text"
                      className="m-0 rounded-[5px] focus:outline-none focus:border-[#15171B] border-[#15171B] border-2 text-[#ffff] bg-[#15171B] p-[9.5px] w-full font-normal "
                      placeholder="Your@domain.com"
                    />
                  </div>
                </div>
              </div>
              <div className="m-0 w-[305px] flex justify-end mt-5  items-center">
                <button className="cursor-pointer rounded-[20px] p-0 bg-[#935CFF] w-[60px] h-6">
                  <div className="[text-align-last:center] rounded-2xl text-[16px] text-sm font-segoe-ui text-white text-left">
                    Send
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
