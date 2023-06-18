import React from 'react'

export const Message = () => {
  return (
    <div className="maxw-[760px] w-[765px] h-[100vh] bg-white">
      <div className="w-[720px] h-[90px] flex flex-wrap gap-[450px] ml-5 justify-center">
        <div className="mt-7">
          <p className="text-3xl font-bold text-[#3F3960]">Laura Palmeri</p>
        </div>
        <div className="flex justify-center">
          <button className="">
            <img className="w-10 h-10 overflow-hidden" alt="" src="/call.svg" />
          </button>
        </div>
      </div>
      <div className="box-border w-[765px] border-t-[1px] border-solid border-[#D1D3D7]" />
      <div className="w-[720px] bg-[#FFFFFF] ml-6 mb-[100px] mt-4 justify-center content-center overflow-scroll hide-scroll">
        <div className="flex flex-wrap">
          <img className="rounded-[38px]  w-9 h-9 object-cover" alt="" src="/icon-user1.png" />
          <div className="h-[20px] ml-5">
            <p className="rounded-3xl border-[#F8F8F8] border-2 text-black bg-[#F8F8F8] p-[3px]">
              Hello there, I’m Dwark Matthiews G. Just in case.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap mt-6 ">
          <div className="h-[20px] mx-[147px] mr-5">
            <p className="rounded-xl border-[#E1E1E1] border-2 text-black bg-[#E1E1E1] p-[3px]">
              Hello Dwark Matthiews G. glad you reach out to me. Which timezon you In, just In case we want.
            </p>
          </div>
          <img className="rounded-[38px]  w-9 h-9 object-cover" alt="" src="/icon-user1.png" />
        </div>

        <div className="flex flex-wrap mt-12">
          <img className="rounded-[38px]  w-9 h-9 object-cover" alt="" src="/icon-user1.png" />
          <div className="h-[20px] ml-5">
            <p className="rounded-3xl border-[#F8F8F8] border-2 text-black bg-[#F8F8F8] p-[3px]">
              I’m currenctly in UTF+8.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap mt-6">
          <div className="h-[20px] mx-[405px] mr-5">
            <p className="rounded-3xl border-[#E1E1E1] border-2 text-black bg-[#E1E1E1] p-[3px]">
              Good to know, let prepare tasks, and get back!
            </p>
          </div>
          <img className="rounded-[38px]  w-9 h-9 object-cover" alt="" src="/icon-user1.png" />
        </div>

        <div className="flex flex-wrap mt-6">
          <img className="rounded-[38px]  w-9 h-9 object-cover" alt="" src="/icon-user1.png" />
          <div className="h-[20px] ml-2">
            <p className="rounded-3xl border-[#F8F8F8] border-2 text-black bg-[#F8F8F8] p-[3px]">
              All good, take your time I’m here.
            </p>
          </div>
        </div>
      </div>
      <div className="absolute w-[755px] bottom-0 h-[70px]  gap-5 flex flex-wrap justify-center bg-[#ffffff]">
        <button className="">
          <img className="w-[30px] rounded-full font-bold h-[30px] overflow-hidden" alt="" src="/attach-file2.svg" />
        </button>
        <div className="mt-3 rounded-3xl bg-[#d7d7d7] w-[580px] h-[45px] flex flex-wrap">
          <div className="rounded-full ml-4 my-2 bg-white w-[30px] h-[30px] justify-between">
            <img className="w-[13.64px] mx-2 h-[28.64px] overflow-hidden" alt="" src="/user.svg" />
          </div>
          <div className="w-[525px] h-[30px] ml-1 mt-[2.5px]">
            <input
              type="text"
              className="rounded-3xl focus:outline-none focus:border-[#d7d7d7] border-[#d7d7d7] border-2 text-black bg-[#d7d7d7] p-2 w-full "
              placeholder="Your message"
            />
          </div>
        </div>
        <button className="">
          <img className="w-[30px] h-[30px]" alt="" src="/send.svg" />
        </button>
      </div>
    </div>
  )
}
