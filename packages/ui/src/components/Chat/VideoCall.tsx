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

import { Resizable } from 're-resizable'
import React from 'react'
import { FaMicrophoneSlash } from 'react-icons/fa'
import DownloadImage1 from './assets/download-image1.png'

export const VideoCall = () => {
  const Users: { userimage: string; username: string; backgroundcolor: string }[] = [
    { username: 'John Laouireen', userimage: DownloadImage1, backgroundcolor: '#7D675A' },
    { username: 'John Laouireen', userimage: DownloadImage1, backgroundcolor: '#DDC1BB' },
    { username: 'John Laouireen', userimage: DownloadImage1, backgroundcolor: '#B4985F' },
    { username: 'John Laouireen', userimage: DownloadImage1, backgroundcolor: '#B79E8E' },
    { username: 'John Laouireen', userimage: DownloadImage1, backgroundcolor: '#949089' },
    { username: 'John Laouireen', userimage: DownloadImage1, backgroundcolor: '#483E69' }
  ]

  return (
    <div className="flex flex-wrap gap-1 mx-1 mt-1">
      {Users.map((item) => {
        return (
          <Resizable
            bounds="window"
            defaultSize={{ width: 254, height: 160 }}
            enable={{
              top: false,
              right: true,
              bottom: true,
              left: true,
              topRight: false,
              bottomRight: true,
              bottomLeft: true,
              topLeft: false
            }}
            minWidth={200}
            maxWidth={420}
            minHeight={160}
            maxHeight={250}
          >
            <div
              className={`relative h-full rounded-[5px] flex items-center justify-center`}
              style={{ backgroundColor: item.backgroundcolor }}
            >
              <img className="rounded-full w-[40px] h-[40px]" alt="" src={item.userimage} />
              <div className="absolute min-w-0 max-w-xs bottom-1 left-1  flex justify-center items-center rounded-[20px] px-1 bg-[#B6AFAE]">
                <p className="[text-align-last:center] rounded-2xl text-[12px] font-segoe-ui text-white text-left">
                  {item.username}
                </p>
              </div>
              <button className="absolute bottom-1 right-1 w-[20px] h-[20px] flex px-1 justify-center  items-center rounded-full bg-[#EDEEF0]">
                <FaMicrophoneSlash className="w-5 h-5 overflow-hidden  fill-[#3F3960]" />
              </button>
            </div>
          </Resizable>
        )
      })}
    </div>
  )
}
