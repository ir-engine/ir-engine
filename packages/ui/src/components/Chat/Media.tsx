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

import React from 'react'

import { Resizable } from 're-resizable'
import DownloadIcon from './assets/download-icon.svg'
import DownloadImage1 from './assets/download-image1.png'
import DownloadImage2 from './assets/download-image2.png'
import DownloadImage3 from './assets/download-image3.png'

export const Media = () => {
  const DownloadImages: { image: string }[] = [
    { image: DownloadImage1 },
    { image: DownloadImage2 },
    { image: DownloadImage3 }
  ]

  const SharedFiles: { username: string; date: string; filesize: string; image: string }[] = [
    { username: 'Dwark Matts', date: '12 Aug 2021', filesize: '428KB', image: DownloadIcon },
    { username: 'Dwark Matts', date: '12 Aug 2021', filesize: '428KB', image: DownloadIcon },
    { username: 'Dwark Matts', date: '12 Aug 2021', filesize: '428KB', image: DownloadIcon }
  ]

  return (
    <>
      <Resizable
        bounds="parent"
        defaultSize={{ height: '100%', width: 370 }}
        enable={{
          top: false,
          right: false,
          bottom: false,
          left: false,
          topRight: false,
          bottomRight: false,
          bottomLeft: false,
          topLeft: false
        }}
        minWidth={320}
        maxWidth={370}
      >
        <div className="w-full h-[100vh] bg-[#E3E5E8]">
          <p className="ml-8 text-3xl font-bold mt-10">Media</p>
          <div className="w-[330] ml-8 h-[189.94px] flex flex-wrap mt-5 gap-5 font-bold">
            {DownloadImages.map((item) => {
              return (
                <img
                  className="max-w-full rounded-8xs w-[120px] h-[84.94px] object-cover"
                  alt=""
                  src={item.image}
                  key={item.image}
                />
              )
            })}
            <button className="m-0 cursor-pointer bg-[transparent] w-[120px] h-[84.94px]">
              <div className="w-[120px] h-[84.94px] rounded bg-[#5B598B] flex flex-col shadow-[0px_0px_4px_rgba(0,_0,_0,_0.1)]">
                <p className="text-[18px] font-semibold font-segoe-ui mt-3 my-[-10px] text-[#EEEEEE] text-center">
                  120
                </p>
                <p className="text-[18px] font-semibold font-segoe-ui text-[#EEEEEE] text-center">Photos</p>
              </div>
            </button>
          </div>
          <p className="text-2xl font-bold my-5 mt-8 ml-8">Shared Files</p>
          <div className="w-full h-[20vh] mt-0 flex flex-wrap">
            {SharedFiles.map((item) => {
              return (
                <div className="w-[330px] h-[2vh] justify-center gap-[48px] flex flex-wrap">
                  <div className="w-[190px] h-[2vh]">
                    <p className="font-semibold text-[#3F3960]">{item.username}</p>
                    <div className="flex flex-wrap gap-2">
                      <p className="text-xs text-[#787589]">{item.date}</p>
                      <div className="flex flex-wrap gap-1">
                        <div className="rounded-[50%] bg-[#3F3960] mt-[4.2px] w-2 h-2" />
                        <p className="text-xs text-[#787589]">{item.filesize}</p>
                      </div>
                    </div>
                  </div>
                  <button className="m-0">
                    <img className="max-w-full w-6 h-6 mt-[6px] overflow-hidden" alt="" src={item.image} />
                  </button>
                </div>
              )
            })}
          </div>
          <div className="w-[330px] flex justify-center items-center mt-4">
            <button className="m-0 cursor-pointer rounded-[20px] p-0 bg-[#3F3960] w-[120px] h-8">
              <div className="text-align-last:center rounded-2xl text-[16px] text-sm font-segoe-ui text-white">
                View more
              </div>
            </button>
          </div>
        </div>
      </Resizable>
    </>
  )
}
