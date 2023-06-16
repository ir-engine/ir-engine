import React, { useState } from 'react'

export const ChatUser = () => {
  const [activeButton, setActiveButton] = useState<number>(2)

  const handleButtonClick = (buttonId: number) => {
    setActiveButton(buttonId)
  }

  return (
    <div className="w-[320px] h-[70vh] overflow-scroll hide-scroll mt-6">
      <div className="w-[320px] mb-[100px] flex flex-wrap gap-1">
        <div
          className={`w-[320px] h-[68px] flex flex-wrap mx-4 gap-2 justify-center rounded-[5px] ${
            activeButton === 1 ? 'bg-[#D4D7DC]' : ''
          }`}
          onClick={() => handleButtonClick(1)}
        >
          <div className="w-[230px] flex flex-wrap gap-3 justify-start">
            <img className="mt-3 rounded-8xs w-11 h-11 object-cover" alt="" src="/icon-user.png" />
            <div className="mt-3 justify-start">
              <p className="font-bold text-[#3F3960]">Dwark Matts</p>
              <p className="h-4 text-xs text-[#787589]">You: UX Consulting</p>
            </div>
          </div>
          <div className="">
            <p className="mt-3 h-4 text-xs text-[#787589]">12m</p>
          </div>
        </div>
        <div
          className={`w-[320px] h-[68px] flex flex-wrap mx-4 gap-2 justify-center rounded-[5px] ${
            activeButton === 2 ? 'bg-[#D4D7DC]' : ''
          }`}
          onClick={() => handleButtonClick(2)}
        >
          <div className="w-[230px] flex flex-wrap gap-3 justify-start">
            <img className="mt-3 rounded-8xs w-11 h-11 object-cover" alt="" src="/icon-user.png" />
            <div className="mt-3 justify-start">
              <p className="font-bold text-[#3F3960]">Laura Palmeri</p>
              <p className="h-4 text-xs text-[#787589]">You: We need a designer</p>
            </div>
          </div>
          <div className="">
            <p className="mt-3 h-4 text-xs text-[#787589]">7m</p>
          </div>
        </div>
        <div
          className={`w-[320px] h-[68px] flex flex-wrap mx-4 gap-2 justify-center rounded-[5px] ${
            activeButton === 3 ? 'bg-[#D4D7DC]' : ''
          }`}
          onClick={() => handleButtonClick(3)}
        >
          <div className="w-[230px] flex flex-wrap gap-3 justify-start">
            <img className="mt-3 rounded-8xs w-11 h-11 object-cover" alt="" src="/icon-user.png" />
            <div className="mt-3 justify-start">
              <p className="font-bold text-[#3F3960]">Josh Hamilda</p>
              <p className="h-4 text-xs text-[#787589]">You: Take the risks</p>
            </div>
          </div>
          <div className="">
            <p className="mt-3 h-4 text-xs text-[#787589]">2m</p>
          </div>
        </div>
      </div>
    </div>
  )
}
