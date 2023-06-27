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

import { InvitationReceived } from './InvitationReceived'
import { InvitationSent } from './InvitationSent'

export const Invitation = () => {
  const [activeButton, setActiveButton] = useState<number>(1)

  const handleButtonClick = (buttonId: number) => {
    setActiveButton(buttonId)
  }

  const [activeComponent, setActiveComponent] = useState<string>('InviteReceived')

  const handleButtonClickComp = (component: string) => {
    setActiveComponent(component)
  }

  return (
    <div className="w-[460px] h-[70%] absolute flex-1 bg-[#15171B] flex flex-wrap">
      <div className="w-full h-[70px] bg-[#15171B] flex flex-wrap gap-3">
        <button>
          <div
            className={`mr-[50px] ml-[80px] ${activeButton === 1 ? 'text-[#935CFF]' : 'text-[#ffff]'}`}
            onClick={() => {
              handleButtonClick(1)
              handleButtonClickComp('InviteReceived')
            }}
          >
            <p className="w-[30px] mt-5 mr-4 font-semibold">RECEIVED</p>
          </div>
        </button>
        <div className="box-border mr-8 w-[70px] border-t-[1px] mt-7 border-solid border-[#f6f7f8] rotate-90" />
        <button>
          <div
            className={`ml-[20px] ${activeButton === 2 ? 'text-[#935CFF]' : 'text-[#ffff]'}`}
            onClick={() => {
              handleButtonClick(2)
              handleButtonClickComp('InviteSent')
            }}
          >
            <p className="w-[30px]  mt-5 font-semibold">SENT</p>
          </div>
        </button>
        <div
          className={`box-border w-[230px] border-t-[1px] border-solid mt-4  border-[#f6f7f8] ${
            activeButton === 1 ? 'ml-[230px]' : 'mr-[230px]'
          }`}
        />
      </div>
      {activeComponent === 'InviteReceived' && <InvitationReceived />}
      {activeComponent === 'InviteSent' && <InvitationSent />}
    </div>
  )
}
