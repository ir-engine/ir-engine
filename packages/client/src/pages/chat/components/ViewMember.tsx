import React from 'react'
import { MdDelete } from 'react-icons/md'

export const ViewMember = () => {
  const Members: { name: string }[] = [
    { name: 'John Laouireen' },
    { name: 'John Laouireen' },
    { name: 'John Laouireen' },
    { name: 'John Laouireen' },
    { name: 'John Laouireen' },
    { name: 'John Laouireen' }
  ]

  return (
    <div className="bg-[#15171B] text-white w-[380px] transform translate-x-0 transition-transform ease-in-out duration-[100]">
      <div className="w-[200px] justify-start mt-[45px] ml-9 gap-2  flex flex-wrap">
        <p className="text-[16px] font-bold text-white">GROUP TEST 1</p>
        <p className="text-[10px] font-bold text-[#83769C] mt-[5px]">12 Member (s)</p>
      </div>
      <div className="w-[380px] flex flex-wrap mt-9 gap-2 justify-center">
        {Members.map((item) => {
          return (
            <div className="rounded-[10px] bg-[#15171B] w-[350px] h-[45px] flex flex-wrap">
              <div className="rounded-full ml-4 my-2 bg-[#26282B] w-[30px] h-[30px] justify-between">
                <img className="w-[13.64px] mx-2 h-[28.64px] overflow-hidden" alt="" src="/user.svg" />
              </div>
              <p className="text-[12px] w-[220px] ml-3 font-bold text-white mt-3.5">{item.name}</p>
              <div className="rounded-full  my-2 bg-[#26282B] w-[30px] h-[30px] justify-between">
                <button className=" w-[40px] ">
                  <MdDelete className="w-[22px] h-[30px] mx-1 fill-[#DD3333] overflow-hidden" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
