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

import { UserName } from '@etherealengine/common/src/schema.type.module'
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

  const SharedFiles: { username: UserName; date: string; filesize: string; image: string }[] = [
    { username: 'Dwark Matts' as UserName, date: '12 Aug 2021', filesize: '428KB', image: DownloadIcon },
    { username: 'Dwark Matts' as UserName, date: '12 Aug 2021', filesize: '428KB', image: DownloadIcon },
    { username: 'Dwark Matts' as UserName, date: '12 Aug 2021', filesize: '428KB', image: DownloadIcon }
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
        <div className="h-[100vh] w-full bg-[#E3E5E8]">
          <p className="ml-8 mt-10 text-3xl font-bold">Media</p>
          <div className="ml-8 mt-5 flex h-[189.94px] w-[330] flex-wrap gap-5 font-bold">
            {DownloadImages.map((item) => {
              return (
                <img
                  className="rounded-8xs h-[84.94px] w-[120px] max-w-full object-cover"
                  alt=""
                  src={item.image}
                  key={item.image}
                />
              )
            })}
            <button className="m-0 h-[84.94px] w-[120px] cursor-pointer bg-[transparent]">
              <div className="flex h-[84.94px] w-[120px] flex-col rounded bg-[#5B598B] shadow-[0px_0px_4px_rgba(0,_0,_0,_0.1)]">
                <p className="font-segoe-ui my-[-10px] mt-3 text-center text-[18px] font-semibold text-[#EEEEEE]">
                  120
                </p>
                <p className="font-segoe-ui text-center text-[18px] font-semibold text-[#EEEEEE]">Photos</p>
              </div>
            </button>
          </div>
          <p className="my-5 ml-8 mt-8 text-2xl font-bold">Shared Files</p>
          <div className="mt-0 flex h-[20vh] w-full flex-wrap">
            {SharedFiles.map((item) => {
              return (
                <div className="flex h-[2vh] w-[330px] flex-wrap justify-center gap-[48px]">
                  <div className="h-[2vh] w-[190px]">
                    <p className="font-semibold text-[#3F3960]">{item.username}</p>
                    <div className="flex flex-wrap gap-2">
                      <p className="text-xs text-[#787589]">{item.date}</p>
                      <div className="flex flex-wrap gap-1">
                        <div className="mt-[4.2px] h-2 w-2 rounded-[50%] bg-[#3F3960]" />
                        <p className="text-xs text-[#787589]">{item.filesize}</p>
                      </div>
                    </div>
                  </div>
                  <button className="m-0">
                    <img className="mt-[6px] h-6 w-6 max-w-full overflow-hidden" alt="" src={item.image} />
                  </button>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex w-[330px] items-center justify-center">
            <button className="m-0 h-8 w-[120px] cursor-pointer rounded-[20px] bg-[#3F3960] p-0">
              <div className="text-align-last:center font-segoe-ui rounded-2xl text-[16px] text-sm text-white">
                View more
              </div>
            </button>
          </div>
        </div>
      </Resizable>
    </>
  )
}
