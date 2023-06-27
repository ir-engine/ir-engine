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

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BsThreeDots } from 'react-icons/bs'

import { DrawerCreateGroup } from './DrawerCreateGroup'
import { GroupEdit } from './GroupEdit'

export const GroupUser = () => {
  const [activeButton, setActiveButton] = useState<number>(2)

  const handleButtonClick = (buttonId: number) => {
    setActiveButton(buttonId)
  }

  const [activeModal, setActiveModal] = useState<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const openModal = (modalId: number) => {
    setActiveModal(modalId)
  }

  const closeModal = useCallback((modalId?: number) => {
    setActiveModal(modalId as number)
  }, [])

  const handleOutsideClick = useCallback(
    (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeModal()
      }
    },
    [modalRef, closeModal]
  )

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  useEffect(() => {
    if (activeModal) {
      document.addEventListener('mousedown', handleOutsideClick)
    } else {
      document.removeEventListener('mousedown', handleOutsideClick)
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [activeModal, handleOutsideClick])

  return (
    <div className="w-[320px] h-[70vh]">
      <div className="w-[320px] mb-[100px] flex flex-wrap mt-6 gap-1">
        <div className="w-[330px] flex justify-center items-center">
          <button className="cursor-pointer rounded-[20px] p-0 bg-[#3F3960] w-[120px] h-8" onClick={toggleDrawer}>
            <div className="[text-align-last:center] rounded-2xl text-[16px] text-sm font-segoe-ui text-white text-left">
              CREATE GROUP
            </div>
          </button>
          {isDrawerOpen && (
            <div className="fixed inset-0 flex z-50">
              <div className="bg-gray-500 bg-opacity-50 flex-1" onClick={toggleDrawer}></div>
              <DrawerCreateGroup />
            </div>
          )}
        </div>
        <div className="w-[320px] mb-[100px] flex flex-wrap gap-2">
          <div
            className={`w-[320px] flex flex-wrap gap-2 mx-3 mt-5 justify-center h-[68px] rounded-[5px] ${
              activeButton === 1 ? 'bg-[#D4D7DC]' : ''
            }`}
            onClick={() => handleButtonClick(1)}
          >
            <div className="w-[230px] flex flex-wrap gap-3 justify-start">
              <div className="mt-3 justify-start">
                <p className="font-bold text-[#3F3960]">Test Group 1</p>
                <p className="h-4 text-xs text-[#787589]">You: We need a designer</p>
              </div>
            </div>
            <div className="mt-6">
              <button onClick={() => openModal(1)}>
                <BsThreeDots />
                <div className="">
                  {activeModal === 1 && (
                    <div ref={modalRef} className="relative flex flex-wrap gap-2">
                      <GroupEdit />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
          <div
            className={`w-[320px] flex flex-wrap gap-2 mx-3 justify-center h-[68px] rounded-[5px] ${
              activeButton === 2 ? 'bg-[#D4D7DC]' : ''
            }`}
            onClick={() => handleButtonClick(2)}
          >
            <div className="w-[230px] flex flex-wrap gap-3 justify-start">
              <div className="mt-3 justify-start">
                <p className="font-bold text-[#3F3960]">Test Group 1</p>
                <p className="h-4 text-xs text-[#787589]">You: We need a designer</p>
              </div>
            </div>
            <div className="mt-6">
              <button onClick={() => openModal(2)}>
                <BsThreeDots />
                <div className="">
                  {activeModal === 2 && (
                    <div ref={modalRef} className="bg-[#919eac] flex flex-wrap gap-2">
                      <GroupEdit />
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
