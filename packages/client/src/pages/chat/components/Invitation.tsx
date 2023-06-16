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
