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

import { ChevronLeftMd as ArrowLeftIcon, ChevronRightMd as ArrowRightIcon } from '@ir-engine/ui/src/icons'
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  BsEyeSlashFill as CameraOffIcon,
  BsEyeFill as CameraOnIcon,
  BsMicMuteFill as MicrophoneOffIcon,
  BsMicFill as MicrophoneOnIcon,
  BsFillExclamationTriangleFill as ReportIcon
} from 'react-icons/bs'
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

import { useMediaWindows, WindowType } from '../../user/VideoWindows'
import {
  SoundIndicatorsType,
  useUserMediaWindowHook,
  useUserMediaWindowsHook,
  WindowStateType
} from '../../user/VideoWindows/hook'
import { ReportUserState } from '../../util/ReportUserState'

import { useGet } from '@ir-engine/common'
import { userPath } from '@ir-engine/common/src/schema.type.module'
import { IconButton } from './buttons/IconButton'
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
  inline-flex

  before:content-[' ']
  before:absolute
  before:-inset-[0.46rem]
  before:border-4
  before:border-white/80
  before:rounded-[1.5rem]
  sm:before:rounded-[1.7rem]
`

const videoInner = `
  relative
  inline-flex
  justify-center
  items-center
  overflow-hidden
  
  w-[41vw]
  aspect-[3/2]
  
  rounded-[1rem]
  bg-white/20
  text-2xl
  font-bold

  sm:h-[12rem]
  sm:w-[18rem]
  sm:rounded-[1.2rem]
`

const videoStyles = `
  h-full
  max-w-[unset]
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
    if (!videoElement) return

    if (videoMediaStream && !videoElement.srcObject) {
      videoElement.autoplay = true
      videoElement.muted = true
      videoElement.setAttribute('playsinline', 'true')

      const newVideoTrack = videoMediaStream.getVideoTracks()[0].clone()
      videoElement.srcObject = new MediaStream([newVideoTrack])
      videoElement.play()
    }

    return () => {
      if (videoElement.srcObject instanceof MediaStream) {
        const tracks = videoElement.srcObject.getTracks()
        tracks.forEach((track) => {
          try {
            track.stop()
          } catch (error) {
            console.debug('Track already stopped:', error)
          }
        })
        videoElement.pause?.()
        videoElement.srcObject = null
      }
    }
  }, [videoElement, videoMediaStream])
}

type VideoType = WindowType & {
  isSpeaking: boolean
}

const Video = ({ peerID, type, userID, isSpeaking }: VideoType) => {
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

  const user = useGet(userPath, userID)

  const reportUser = () => {
    ReportUserState.setReportedPeerId(peerID)
    navigateTo('report')
  }

  return (
    <div className={twMerge(videoContainer, isSpeaking ? `` : `before:hidden`)}>
      <div className={twMerge(videoInner)}>
        {showVideo ? <video className={videoStyles} ref={ref} /> : <img className={``} src={avatarThumbnail} />}
        <span
          className={`absolute left-2 top-1 text-[1rem] font-light`}
          style={{ textShadow: `0px 2px 2px rgba(0, 0, 0, 0.25)` }}
        >
          {user?.data?.name}
        </span>
        <div className={twMerge(videoButtonsContainer)}>
          <div className={twMerge(videoButtonsInner)}>
            <button onClick={toggleVideo} className={`cursor-pointer`}>
              {camVideoOn ? <CameraOnIcon /> : <CameraOffIcon />}
            </button>
            <button onClick={toggleAudio} className={`cursor-pointer`}>
              {camAudioOn ? <MicrophoneOnIcon /> : <MicrophoneOffIcon />}
            </button>
            <button onClick={reportUser} className={`cursor-pointer`}>
              <ReportIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const videoMenuContainer = `
  inline-grid
  grid-cols-[min-content]
  justify-center
  gap-y-8

  py-8
  px-[6vw]
  sm:px-4
`

const videosContainer = `
  inline-grid
  grid-cols-[auto_auto]
  justify-center

  gap-[6vw]
  sm:gap-8
`

const arrowsContainer = `
  flex items-center
  justify-between
`
const numVideosPerPage = 6

const VideosProviderContext = createContext(
  {} as {
    soundIndicators: SoundIndicatorsType
    videos: WindowStateType[]
  }
)

export const VideosProvider = ({ children }) => {
  const windows = useMediaWindows()

  const { _windows: videos, soundIndicators } = useUserMediaWindowsHook(windows)

  return (
    <VideosProviderContext.Provider
      value={{
        videos,
        soundIndicators
      }}
    >
      {children}
    </VideosProviderContext.Provider>
  )
}

export const useVideosProvider = () => useContext(VideosProviderContext)

export const VideoMenu = () => {
  const [pageIndex, setPageIndex] = useState(0)

  const { videos, soundIndicators } = useVideosProvider()

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
      return page.map(({ peerID, type, userID }, j) => {
        const isSpeaking = soundIndicators.value[peerID]

        return <Video key={`${peerID}-${type}`} userID={userID} peerID={peerID} type={type} isSpeaking={isSpeaking} />
      })
    })

    return videosByPage
  }, [videos, soundIndicators])

  const numPages = videosByPage.length
  const currentPageVideos = videosByPage[pageIndex] || []

  const isLastPage = pageIndex >= numPages - 1
  const isFirstPage = pageIndex <= 0

  const needsFillers = isLastPage && videos.length % numVideosPerPage !== 0
  const minNumPages = Math.ceil(videos.length / numVideosPerPage)
  const totalNumVideosWithFiller = minNumPages * numVideosPerPage
  const numFiller = totalNumVideosWithFiller - videos.length

  const videoEls = !needsFillers
    ? currentPageVideos
    : [
        ...currentPageVideos,
        ...[...Array(numFiller)].map((__, i) => {
          return <div key={i} className={twMerge(videoInner)} />
        })
      ]

  useEffect(() => {
    const lastPageIndex = videosByPage.length - 1

    if (pageIndex > lastPageIndex) {
      setPageIndex(lastPageIndex)
    }

    if (pageIndex <= 0) {
      setPageIndex(0)
    }
  }, [pageIndex, videosByPage.length])

  const pageLabel = `${pageIndex + 1}/${numPages}`

  return (
    <div className={videoMenuContainer}>
      <div className={videosContainer}>{videoEls}</div>

      {videosByPage.length ? (
        <div className={arrowsContainer}>
          <IconButton
            size={'small'}
            onClick={isFirstPage ? () => {} : () => setPageIndex(pageIndex - 1)}
            className={isFirstPage ? `collapse` : ``}
          >
            <ArrowLeftIcon />
          </IconButton>
          <div
            className={`
              flex items-center
              gap-x-4
              tracking-wide
            `}
          >
            {pageLabel}
            <IconButton
              size={'small'}
              onClick={() => setPageIndex(pageIndex + 1)}
              className={isLastPage ? `hidden` : ``}
            >
              <ArrowRightIcon />
            </IconButton>
          </div>
        </div>
      ) : (
        <></>
      )}

      {videosByPage.length ? (
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
      ) : (
        <></>
      )}
    </div>
  )
}
