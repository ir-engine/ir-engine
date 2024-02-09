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
    <div className="absolute flex h-[70%] w-[520px] flex-1 flex-wrap bg-[#15171B]">
      <div className="flex h-[14%] w-full flex-wrap bg-[#15171B]">
        <div className="ml-7 mt-[26px] flex w-[180px] flex-wrap  justify-start gap-2">
          <IoMdAddCircle className="h-[25px] w-[22px] fill-[#ffffff]" />
          <p className="text-[16px] font-bold text-white">CREATE</p>
        </div>
      </div>
      <div className="ml-[150px] box-border w-[370px] border-t-[1px]  border-solid border-[#f6f7f8]" />

      <div className="grid h-[86%] w-full grid-cols-2 divide-x-0 bg-[#f6f7f8]">
        <div className="h-[100%] w-[150px] bg-[#15171B]">
          <div
            className={`ml-7 mt-7 flex w-[120px]  flex-wrap justify-start gap-2 ${
              activeSideButton === 1 ? 'text-[#935CFF]' : 'text-[#ffffff]'
            }`}
            onClick={() => handleSideButtonClick(1)}
          >
            <FriendIcon color={activeSideButton === 1 ? '#935CFF' : '#ffffff'} />
            <p className="mt-2 text-[16px] font-bold">FRIENDS</p>
          </div>
          <div
            className={`ml-7 mt-6 flex w-[120px]  flex-wrap justify-start gap-2 ${
              activeSideButton === 2 ? 'text-[#935CFF]' : 'text-[#ffffff]'
            }`}
            onClick={() => handleSideButtonClick(2)}
          >
            <PartyIcon color={activeSideButton === 2 ? '#935CFF' : '#ffffff'} />
            <p className="mt-2.5 text-[16px] font-bold">PARTY</p>
          </div>
          <div
            className={`ml-7 mt-6 flex w-[120px]  flex-wrap justify-start gap-2 ${
              activeSideButton === 3 ? 'text-[#935CFF]' : 'text-[#ffffff]'
            }`}
            onClick={() => handleSideButtonClick(3)}
          >
            <GroupIcon color={activeSideButton === 3 ? '#935CFF' : '#ffffff'} />
            <p className="mt-2.5 text-[16px] font-bold">GROUP</p>
          </div>
        </div>
        <div className="ml-[-108px] h-[100%] w-[368px] bg-[#15171B]">
          <div className="my-4 ml-5 mt-4 flex w-[350px] flex-wrap justify-start gap-[9px] ">
            <button
              className={`m-0 box-border h-6 w-[87px] cursor-pointer rounded-[20px] border-[1px] border-dashed p-0 ${
                activeButton === 1 ? 'border-[#935CFF] bg-[#935CFF] text-white' : 'border-[#595C60] text-[#A0A0B2]'
              }`}
              onClick={() => handleButtonClick(1)}
            >
              <div className="ml-2 flex  w-[180px] flex-wrap justify-start gap-2">
                <MdEmail className="h-[22px] w-[20px] fill-[#ffffff]" />
                <p className="text-[16px] font-normal text-white">Email</p>
              </div>
            </button>
            <button
              className={`m-0 box-border h-6 w-[86px] cursor-pointer rounded-[20px] border-[1px] border-dashed p-0 ${
                activeButton === 2 ? 'border-[#935CFF] bg-[#935CFF] text-white' : 'border-[#595C60] text-[#A0A0B2]'
              }`}
              onClick={() => handleButtonClick(2)}
            >
              <div className="ml-2 flex  w-[180px] flex-wrap justify-start gap-1">
                <MdPhoneIphone className="mt-[3px] h-[15px] w-[20px] fill-[#ffffff]" />
                <p className="text-[15px] font-normal text-white">Phone</p>
              </div>
            </button>
            <button
              className={`m-0 box-border h-6 w-[111px] cursor-pointer rounded-[20px] border-[1px] border-dashed p-0 ${
                activeButton === 3 ? 'border-[#935CFF] bg-[#935CFF] text-white' : 'border-[#595C60] text-[#A0A0B2]'
              }`}
              onClick={() => handleButtonClick(3)}
            >
              <div className="ml-2 flex  w-[180px] flex-wrap justify-start gap-2">
                <BsPersonCircle className="h-[20px] w-[15px] fill-[#ffff]" />
                <p className="text-[14px] font-normal text-white">Invite Code</p>
              </div>
            </button>
            <div className="h-[50vh] w-[340px]">
              <div className="mt-8 w-[40px]">
                <p className="font-sans text-white">Email:</p>
                <div className="mt-3 flex h-[45px] w-[306px] flex-wrap rounded-[5px] bg-[#d7d7d7]">
                  <div className="ml-[0.5px] mr-[0.5px] mt-[2px] h-[40px] w-[305px]">
                    <input
                      type="text"
                      className="m-0 w-full rounded-[5px] border-2 border-[#15171B] bg-[#15171B] p-[9.5px] font-normal text-[#ffff] focus:border-[#15171B] focus:outline-none "
                      placeholder="Your@domain.com"
                    />
                  </div>
                </div>
              </div>
              <div className="m-0 mt-5 flex w-[305px] items-center  justify-end">
                <button className="h-6 w-[60px] cursor-pointer rounded-[20px] bg-[#935CFF] p-0">
                  <div className="font-segoe-ui rounded-2xl text-left text-[16px] text-sm text-white [text-align-last:center]">
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
