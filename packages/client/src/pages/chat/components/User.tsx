import React, { useState } from 'react'

export const User = () => {
  const [checked, setChecked] = useState(false)

  const handleToggle = () => {
    setChecked(!checked)
  }

  const [isToggleOn, setIsToggleOn] = useState(false)

  const switchToggle = () => {
    setIsToggleOn(!isToggleOn)
  }

  return (
    <div className="max-w-[420px] w-[420px] flex">
      <div className="bg-[#E3E5E8] w-[100px] h-[100vh]" id="sidebar" />
      <div className="w-[320px] h-[100vh] [background:linear-gradient(180deg,_#e3e5e8,_#f2f3f5_6.7%,_#f2f3f5_94.1%,_#e3e5e8)]">
        <div className="w-full h-[90px] flex flex-wrap gap-[92px] justify-center">
          <div className="mt-6">
            <b className="text-3xl">Chats</b>
          </div>
          <div className="flex justify-center gap-2">
            <button className="">
              <img className="w-6 h-6 overflow-hidden" alt="" src="/icbaselinenotifications.svg" />
            </button>
            <button className="">
              <img className="w-6 h-6 overflow-hidden" alt="" src="/bxbxsearchalt2.svg" />
            </button>
            <button className="">
              <img className="w-6 h-6 overflow-hidden" alt="" src="/fluentaddsquare24filled.svg" />
            </button>
          </div>
        </div>
        <div className="box-border w-[320px] border-t-[1px] border-solid border-[#D1D3D7]" />
        <div className="w-full flex flex-wrap justify-start ml-8 mt-4 gap-[9px]">
          <button className="cursor-pointer rounded-[20px] border-dashed box-border border-[1px] p-0 border-[#A0A0B2] w-[76px] h-6">
            <div className=" [text-align-last:center] rounded-xl text-sm font-segoe-ui text-[#A0A0B2] text-left">
              Party
            </div>
          </button>
          <button className="cursor-pointer rounded-[20px] p-0 bg-[#3F3960]  w-[76px] h-6">
            <div className=" [text-align-last:center] rounded-xl bg-dark1 shadow-[0px_4px_4px_rgba(63,_57,_96,_0.25)]  text-sm font-segoe-ui text-white text-left">
              Friends
            </div>
          </button>
          <button className="cursor-pointer rounded-[20px] border-dashed box-border border-[1px] p-0 border-[#A0A0B2] w-[76px] h-6">
            <div className=" [text-align-last:center] rounded-xl text-sm font-segoe-ui text-[#A0A0B2] text-left">
              Group
            </div>
          </button>
          <button className="cursor-pointer rounded-[20px] border-dashed box-border border-[1px] p-0 border-[#A0A0B2] w-[76px] h-6">
            <div className=" [text-align-last:center] rounded-xl text-sm font-segoe-ui text-[#A0A0B2] text-left">
              Layer
            </div>
          </button>
          <button className="cursor-pointer rounded-[20px] border-dashed box-border border-[1px] p-0 border-[#A0A0B2] w-[76px] h-6">
            <div className=" [text-align-last:center] rounded-xl text-sm font-segoe-ui text-[#A0A0B2] text-left">
              Instance
            </div>
          </button>
        </div>
        <div className="box-border mt-4 w-[320px] border-t-[1px] border-solid border-[#D1D3D7]" />
        <div className="w-[320px] mb-[100px] flex flex-wrap gap-1">
          <div className="w-[320px] flex flex-wrap gap-2 mx-3 justify-center h-[68px]">
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
          <div className="w-[320px] h-[68px] flex flex-wrap mx-4 gap-2 justify-center rounded-[5px] bg-[#D4D7DC]">
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
          <div className="w-[320px] flex flex-wrap gap-2 mx-3 justify-center h-[68px]">
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
        <div className="absolute bottom-0 w-[320px] h-[70px] gap-4 flex flex-wrap justify-center bg-[#ECECEC]">
          <img className="rounded-[38px] mt-3 w-11 h-11 object-cover" alt="" src="/icon-user1.png" />
          <div className="mt-3">
            <p className="font-bold text-[#3F3960]">Laura Palmeri</p>
            <div className="flex flex-wrap gap-1">
              <div className={`${isToggleOn ? 'bg-[#57C290]' : 'bg-[#b3b5b9]'} rounded-[50%] mt-[4.2px] w-2.5 h-2.5`} />
              <p className="h-4 text-xs text-[#787589]">Active now</p>
            </div>
          </div>
          <label className="cursor-pointer mt-[24px]">
            <div className="relative">
              <input
                type="checkbox"
                className="hidden"
                checked={checked}
                onChange={handleToggle}
                onClick={switchToggle}
              />
              <div
                className={`toggle__line w-10 h-5 bg-gray-400 rounded-full shadow-inner ${
                  checked ? 'bg-[#1d1932]' : ''
                }`}
              ></div>
              <div
                className={`toggle__dot absolute w-4 h-4 bg-white rounded-full shadow inset-y-[2px] inset-x-[2px] ${
                  checked ? 'translate-x-5' : ''
                }`}
              ></div>
            </div>
          </label>
          <button className="">
            <img className="w-6 h-6 overflow-hidden" alt="" src="/setting.svg" />
          </button>
        </div>
      </div>
    </div>
  )
}
