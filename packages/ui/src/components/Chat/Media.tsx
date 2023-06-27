import React from 'react'

import DownloadIcon from './assets/download-icon.svg'
import DownloadImage1 from './assets/download-image1.png'
import DownloadImage2 from './assets/download-image2.png'
import DownloadImage3 from './assets/download-image3.png'

export const Media = () => {
  return (
    <div className="w-[350px] h-[100vh] bg-[#E3E5E8] left-[720px]">
      <p className="my-[32px] ml-8 text-3xl font-bold">Media</p>
      <div className="w-[290px] ml-8 h-[189.94px] flex flex-wrap gap-5 text-3xl font-bold">
        <img className="rounded-8xs w-[120px] h-[84.94px] object-cover" alt="" src={DownloadImage1} />
        <img className="rounded-8xs w-[120px] h-[84.94px] object-cover" alt="" src={DownloadImage2} />
        <img className="rounded-8xs w-[120px] h-[84.94px] object-cover" alt="" src={DownloadImage3} />
        <button className="cursor-pointer bg-[transparent] w-[120px] h-[84.94px]">
          <div className="w-[120px] h-[84.94px] rounded bg-[#5B598B] flex flex-col shadow-[0px_0px_4px_rgba(0,_0,_0,_0.1)]">
            <p className="text-[18px] font-semibold font-segoe-ui mt-3 my-[-10px] text-[#EEEEEE] text-center">120</p>
            <p className="text-[18px] font-semibold font-segoe-ui text-[#EEEEEE] text-center">Photos</p>
          </div>
        </button>
      </div>
      <p className="text-2xl font-bold my-5 mt-8 ml-8">Shared Files</p>
      <div className="w-[300px] h-[20vh] mt-0 flex flex-wrap">
        <div className="w-[330px] h-[2vh] justify-center gap-[48px] ml-6 flex flex-wrap">
          <div className="w-[190px] h-[2vh]">
            <p className="font-semibold text-[#3F3960]">Dwark Matts</p>
            <div className="flex flex-wrap gap-2">
              <p className="text-xs text-[#787589]">12 Aug 2021</p>
              <div className="flex flex-wrap gap-1">
                <div className="rounded-[50%] bg-[#3F3960] mt-[4.2px] w-2 h-2" />
                <p className="text-xs text-[#787589]">428KB</p>
              </div>
            </div>
          </div>
          <button>
            <img className="w-6 h-6 mt-[6px] overflow-hidden" alt="" src={DownloadIcon} />
          </button>
        </div>
        <div className="w-[330px] h-[2vh] justify-center gap-[48px] ml-6 flex flex-wrap">
          <div className="w-[190px] h-[2vh]">
            <p className="font-semibold text-[#3F3960]">Dwark Matts</p>
            <div className="flex flex-wrap gap-2">
              <p className="text-xs text-[#787589]">12 Aug 2021</p>
              <div className="flex flex-wrap gap-1">
                <div className="rounded-[50%] bg-[#3F3960] mt-[4.2px] w-2 h-2" />
                <p className="text-xs text-[#787589]">428KB</p>
              </div>
            </div>
          </div>
          <button>
            <img className="w-6 h-6 mt-[6px] overflow-hidden" alt="" src={DownloadIcon} />
          </button>
        </div>
        <div className="w-[330px] h-[2vh] justify-center gap-[48px] ml-6 flex flex-wrap">
          <div className="w-[190px] h-[2vh]">
            <p className="font-semibold text-[#3F3960]">Dwark Matts</p>
            <div className="flex flex-wrap gap-2">
              <p className="text-xs text-[#787589]">12 Aug 2021</p>
              <div className="flex flex-wrap gap-1">
                <div className="rounded-[50%] bg-[#3F3960] mt-[4.2px] w-2 h-2" />
                <p className="text-xs text-[#787589]">428KB</p>
              </div>
            </div>
          </div>
          <button>
            <img className="w-6 h-6 mt-[6px] overflow-hidden" alt="" src={DownloadIcon} />
          </button>
        </div>
      </div>
      <div className="w-[330px] flex justify-center items-center mt-4">
        <button className="cursor-pointer rounded-[20px] p-0 bg-[#3F3960] w-[120px] h-8">
          <div className="text-align-last:center rounded-2xl text-[16px] text-sm font-segoe-ui text-white">
            View more
          </div>
        </button>
      </div>
    </div>
  )
}
