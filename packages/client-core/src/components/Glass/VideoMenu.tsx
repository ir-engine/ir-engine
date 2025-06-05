/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Camera01Md, ChevronLeftMd, ChevronRightMd, Microphone01Md } from '@ir-engine/ui/src/icons'
import React, { useState } from 'react'
import { BsFillExclamationTriangleFill } from 'react-icons/bs'
import { twMerge } from 'tailwind-merge'
import { MultimediaStateProvider } from './MultimediaStateProvider'
import {
  CamButton,
  containerStyles as containerStyles_base,
  gridStyles_base,
  MicButton,
  ScreenshareButton,
  sectionStyles_base
} from './ToolbarMenu'

import { smallIconButtonStyles } from './Buttons'

const toolbarContainerStyles = `
  flex
  justify-center
`

const containerStyles = twMerge(
  containerStyles_base,
  `
    border-white/10
    bg-white/10
  `
)

const gridStyles = `
  ${gridStyles_base}
  flex-row flex-row-reverse
  gap-x-3
  px-5 py-1 pl-6
`

const sectionStyles = `
  ${sectionStyles_base}
  
  flex-row
  px-0 pt-2
`

const videoContainer = `
  relative
  z-10
  
  flex
  justify-center
  items-center
  overflow-hidden

  h-[9.33rem]
  w-[14rem]

  rounded-3xl
  border-4
  border-white/80
  
  bg-white/40
  text-2xl
  font-bold

  sm:h-[12rem]
  sm:w-[18rem]
`

const videoButtonsContainer = `
  absolute
  inset-0
  z-20
  group
`

const videoButtonsInner = `
  absolute
  bottom-0
  left-0
  right-0
  flex
  
  justify-between
  gap-x-2
  bg-black/30
  px-8
  py-2
  text-4xl
  text-white
  invisible
  group-hover:visible
`

const DesktopVideo = ({ children }) => (
  <div style={{ textShadow: `0 0.03em 0.08em hsla(0, 0%, 0%, 0.4)` }} className={twMerge(videoContainer)}>
    <div className={twMerge(videoButtonsContainer)}>
      <div className={twMerge(videoButtonsInner)}>
        <button onClick={() => {}} className={`cursor-pointer`}>
          <Camera01Md />
        </button>
        <button onClick={() => {}} className={`cursor-pointer`}>
          <Microphone01Md />
        </button>
        <button onClick={() => {}} className={`cursor-pointer`}>
          <BsFillExclamationTriangleFill />
        </button>
      </div>
    </div>
    {children}
  </div>
)

const videoMenuContainer = `
  inline-grid
  grid-cols-[min-content]
  justify-center
  gap-y-4
`

const videosContainer = `
  inline-grid
  grid-cols-[auto_auto]
  justify-center
  
  gap-4
  sm:gap-6
`

const arrowsContainer = `
  flex
  
  items-center
  justify-end
  gap-x-4
  tracking-wide
`

export const VideoMenu = () => {
  const numVideos = 20

  const [videoProps, setVideoProps] = useState([...Array(numVideos)])

  const [pageIndex, setPageIndex] = useState(0)

  const videoPages: number[][] = []
  let _page: number[] = []

  const maxPageLength = 6

  videoProps.map((__, i: number) => {
    if (_page.length === maxPageLength) {
      videoPages.push(_page)
      _page = []
    }

    _page.push(i)
  })

  const videos = videoPages[pageIndex].map((num, i) => {
    return <DesktopVideo>{num}</DesktopVideo>
  })

  const numPages = videoPages.length

  return (
    <div className={videoMenuContainer}>
      <div className={videosContainer}>{videos}</div>

      <div className={arrowsContainer}>
        <button
          onClick={() => setPageIndex(pageIndex - 1)}
          className={twMerge(smallIconButtonStyles, pageIndex === 0 ? `hidden` : ``)}
        >
          <ChevronLeftMd />
        </button>
        {`${pageIndex + 1}/${numPages}`}
        <button
          onClick={() => setPageIndex(pageIndex + 1)}
          className={twMerge(smallIconButtonStyles, pageIndex === numPages - 1 ? `hidden` : ``)}
        >
          <ChevronRightMd />
        </button>
      </div>

      <div className={toolbarContainerStyles}>
        <div className={containerStyles}>
          <div className={gridStyles}>
            <div className={sectionStyles}>
              <MultimediaStateProvider>
                <ScreenshareButton />
                <CamButton />
                <MicButton />
              </MultimediaStateProvider>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
