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

import {
  ChevronLeftMd,
  ChevronRightMd,
  Microphone01Md,
  MicrophoneOff,
  VideoRecorderMd,
  VideoRecorderOffMd
} from '@ir-engine/ui/src/icons'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { BsFillExclamationTriangleFill } from 'react-icons/bs'
import { twMerge } from 'tailwind-merge'
import { MultimediaStateProvider, useMultimediaStateProvider } from './MultimediaStateProvider'
import {
  CamButton,
  containerStyles as containerStyles_base,
  gridStyles_base,
  MicButton,
  ScreenshareButton,
  sectionStyles_base
} from './ToolbarMenu'

import { WindowType } from '../../user/VideoWindows'
import { useUserMediaWindowHook } from '../../user/VideoWindows/hook'
import { ReportUserState } from '../../util/ReportUserState'

import { smallIconButtonStyles } from './Buttons'
import { useNavigationProvider } from './NavigationProvider'

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
  
  bg-white/20
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

export const useVideoStream = (videoElement, videoMediaStream) => {
  useEffect(() => {
    if (!videoElement || videoElement.srcObject || !videoMediaStream) return

    videoElement.autoplay = true
    videoElement.muted = true
    videoElement.setAttribute('playsinline', 'true')

    const newVideoTrack = videoMediaStream.getVideoTracks()[0].clone()
    videoElement.srcObject = new MediaStream([newVideoTrack])
    videoElement.play()
  }, [videoElement, videoMediaStream])
}

const Video = ({ peerID, type }: WindowType) => {
  const {
    isSelf,
    isPiP,
    isScreen,
    videoMediaStream,
    audioMediaStream,
    avatarThumbnail,
    videoStreamPaused,
    audioStreamPaused,
    togglePiP,
    toggleAudio,
    toggleVideo
  } = useUserMediaWindowHook({
    peerID,
    type
  })

  const { isCamVideoEnabled, isCamAudioEnabled } = useMultimediaStateProvider()
  const { navigateTo } = useNavigationProvider()

  const ref = useRef<HTMLVideoElement>(null)

  useVideoStream(ref.current, videoMediaStream)

  const showVideoIfSelf = isSelf ? isCamVideoEnabled : true
  const showVideo = showVideoIfSelf && !videoStreamPaused

  const camVideoOn = isSelf ? isCamVideoEnabled : !videoStreamPaused
  const camAudioOn = isSelf ? isCamAudioEnabled : !audioStreamPaused

  const reportUser = () => {
    ReportUserState.setReportedPeerId(peerID)
    navigateTo('ReportUser', '')
  }

  return (
    <div className={twMerge(videoContainer)}>
      {showVideo ? (
        <video
          className={`
            h-full
            max-w-[unset]
          `}
          ref={ref}
        />
      ) : (
        <img className={``} src={avatarThumbnail} />
      )}
      <div className={twMerge(videoButtonsContainer)}>
        <div className={twMerge(videoButtonsInner)}>
          <button onClick={toggleVideo} className={`cursor-pointer`}>
            {camVideoOn ? <VideoRecorderMd /> : <VideoRecorderOffMd />}
          </button>
          <button onClick={toggleAudio} className={`cursor-pointer`}>
            {camAudioOn ? <Microphone01Md /> : <MicrophoneOff />}
          </button>
          <button onClick={reportUser} className={`cursor-pointer`}>
            <BsFillExclamationTriangleFill />
          </button>
        </div>
      </div>
    </div>
  )
}

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
  flex items-center
  justify-between
`
const numVideosPerPage = 6

export const VideoMenu = ({ videos = [] }: { videos: WindowType[] }) => {
  const [pageIndex, setPageIndex] = useState(0)

  const videosByPage = useMemo(() => {
    const videoPages: WindowType[][] = []
    let page: WindowType[] = []

    videos.map((videoProps, i: number) => {
      page.push(videoProps)

      const isPageFull = page.length === numVideosPerPage
      const isLastVideo = i === videos.length - 1

      if (isPageFull || isLastVideo) {
        videoPages.push(page)
        page = []
      }
    })

    const videosByPage = videoPages.map((page, i) => {
      return page.map((videoProps, j) => {
        return <Video key={`${i}-${j}`} {...videoProps} />
      })
    })

    return videosByPage
  }, [videos])

  const numPages = videosByPage.length
  const currentPageVideos = videosByPage[pageIndex] || []

  const isLastPage = pageIndex === videosByPage.length - 1

  const needsFillers = isLastPage && videos.length % numVideosPerPage !== 0
  const minNumPages = Math.ceil(videos.length / numVideosPerPage)
  const totalNumVideosWithFiller = minNumPages * numVideosPerPage
  const numFiller = totalNumVideosWithFiller - videos.length

  const videoEls = !needsFillers
    ? currentPageVideos
    : [
        ...currentPageVideos,
        ...[...Array(numFiller)].map(() => {
          return <div className={twMerge(videoContainer)} />
        })
      ]

  useEffect(() => {
    const lastPageIndex = videosByPage.length - 1

    if (pageIndex > lastPageIndex) {
      setPageIndex(lastPageIndex)
    }
  }, [pageIndex, videosByPage.length])

  return (
    <div className={videoMenuContainer}>
      <div className={videosContainer}>{videoEls}</div>

      <div className={arrowsContainer}>
        <button
          onClick={() => setPageIndex(pageIndex - 1)}
          className={twMerge(smallIconButtonStyles, pageIndex === 0 ? `collapse` : ``)}
        >
          <ChevronLeftMd />
        </button>
        <div
          className={`
          flex items-center
          gap-x-4
          tracking-wide
        `}
        >
          {`${pageIndex + 1}/${numPages}`}
          <button
            onClick={() => setPageIndex(pageIndex + 1)}
            className={twMerge(smallIconButtonStyles, pageIndex === numPages - 1 ? `hidden` : ``)}
          >
            <ChevronRightMd />
          </button>
        </div>
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
