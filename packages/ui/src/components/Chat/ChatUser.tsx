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

import UserIcon from './assets/icon-user.png'

export const ChatUser = () => {
  const [activeButton, setActiveButton] = useState<number>(2)

  const handleButtonClick = (buttonId: number) => {
    setActiveButton(buttonId)
  }
  const Users: { name: string; subtitle: string; lastsent: string }[] = [
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' },
    { name: 'Dwark', subtitle: 'UI UX designer', lastsent: '12m' }
  ]

  return (
    <div className="w-[320px] h-[70vh] overflow-scroll hide-scroll mt-[8px]">
      <div className="w-[320px] mb-[42px] flex flex-wrap gap-[0.5px]">
        {Users.map((item, index) => {
          return (
            <>
              <div
                className={`w-[320px] h-[68px] flex flex-wrap mx-4 gap-1 justify-center rounded-[5px] ${
                  activeButton === index ? 'bg-[#D4D7DC]' : ''
                }`}
                onClick={() => handleButtonClick(index)}
              >
                <div className="w-[230px] flex flex-wrap gap-5 justify-start">
                  <img className="mt-3 rounded-8xs w-11 h-11 object-cover" alt="" src={UserIcon} />
                  <div className="mt-3 justify-start">
                    <p className="font-bold text-[#3F3960]">{item.name}</p>
                    <p className="h-4 text-xs text-[#787589]">{item.subtitle}</p>
                  </div>
                </div>
                <div className="">
                  <p className="mt-3 h-4 text-xs text-[#787589]">{item.lastsent}</p>
                </div>
              </div>
            </>
          )
        })}
      </div>
    </div>
  )
}
