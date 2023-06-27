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
