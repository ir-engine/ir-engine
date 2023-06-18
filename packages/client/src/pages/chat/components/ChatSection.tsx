import React, { useEffect, useRef, useState } from 'react'

import { ChatUser } from './ChatUser'
import { Create } from './Create'
import { GroupUser } from './GroupUser'

export const ChatSection = () => {
  const ChatTypes: string[] = ['Party', 'Friends', 'Group', 'Layer', 'Instance']

  const [activeComponent, setActiveComponent] = useState<number>(1)

  const handleButtonClickComp = (component: number) => {
    setActiveComponent(component)
  }

  const [activeButton, setActiveButton] = useState<number>(1)

  const handleButtonClick = (buttonId: number) => {
    setActiveButton(buttonId)
  }

  const [checked, setChecked] = useState<boolean>(false)

  const handleToggle = () => {
    setChecked(!checked)
  }

  const [isToggleOn, setIsToggleOn] = useState<boolean>(false)

  const switchToggle = () => {
    setIsToggleOn(!isToggleOn)
  }

  const [isModalOpen, setIsModalOpen] = useState<number | null>(null)
  const openModal = (modalId: number) => {
    setIsModalOpen(modalId)
  }

  const closeModal = () => {
    setIsModalOpen(null)
  }

  const modalRef = useRef<HTMLDivElement | null>(null)
  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal()
    }
  }

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    } else {
      document.removeEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isModalOpen])

  return (
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
          <button onClick={() => openModal(1)}>
            <img className="w-6 h-6 overflow-hidden" alt="" src="/fluentaddsquare24filled.svg" />
            {isModalOpen === 1 && (
              <div
                ref={modalRef}
                className="fixed w-full h-[100vh] inset-0 flex bg-black  items-center justify-center bg-opacity-50"
                style={{ zIndex: '1' }}
              >
                <Create />
              </div>
            )}
          </button>
        </div>
      </div>
      <div className="box-border w-[320px] border-t-[1px] border-solid border-[#D1D3D7]" />
      <div className="w-full flex flex-wrap justify-start ml-8 mt-4 my-4 gap-[9px]">
        {ChatTypes.map((item, index) => {
          return (
            <button
              className={`cursor-pointer rounded-[20px] border-dashed box-border border-[1px] p-0 border-[#A0A0B2] w-[76px] h-6 ${
                activeButton === index ? 'bg-[#3F3960] text-white' : 'text-[#A0A0B2]'
              }`}
              onClick={() => {
                handleButtonClick(index)
                handleButtonClickComp(index)
              }}
            >
              <div className={`[text-align-last:center] rounded-xl text-sm font-segoe-ui text-left`}>{item}</div>
            </button>
          )
        })}
      </div>
      <div className="box-border w-[320px] border-t-[1px] border-solid border-[#D1D3D7]" />

      {activeComponent === 1 && <ChatUser />}
      {activeComponent === 2 && <GroupUser />}
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
              className={`toggle__line w-10 h-5  rounded-full shadow-inner ${checked ? 'bg-[#3F3960]' : 'bg-gray-400'}`}
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
  )
}
