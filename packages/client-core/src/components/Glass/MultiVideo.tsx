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

import { Expand01Md, VolumeMinMd, VolumeXMd } from '@ir-engine/ui/src/icons'
import { useMotionValueEvent, useScroll } from 'motion/react'
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { IconButton } from './buttons/IconButton'
import { useVideoStream } from './VideoMenu'

function interpolateRange(value, [fromMax, fromMin], [toMax, toMin]) {
  const normalized = (value - fromMin) / (fromMax - fromMin)
  const toRange = toMax - toMin

  return toMin + normalized * toRange
}

const containerStyles = `
  absolute
  left-6
  top-6
  
  pointer-events-auto
  select-none
  
  flex
  flex-col
  gap-y-2
`

const videosListStyles = `
  scrollbar-hide
  overflow-y-auto
  cursor-pointer
`

const videosStyles = `
  pointer-events-auto
  sticky top-0
  z-10
`

const videoStyles = `
  flex items-center justify-center

  overflow-hidden

  rounded-xl
  border-2
  border-white/90
  bg-white/10
  backdrop-blur-3xl

  text-xl
  text-white
  font-bold

  transition-transform
  duration-150
`

const collapsedVideosStyles = `
  sticky top-0
  z-10
  flex
  cursor-pointer
`

const bottomButtonsStyles = `
  flex
  justify-between
`

const windowSize = 4
const stackSize = 2

const stackVideoGap = 0.4
const windowVideoGap = 0.5

const stackScaleMin = 0.75

const halfWindowSize = windowSize / 2

const aspectRatio = 9 / 16

const videoWidth = 10
const videoHeight = videoWidth * aspectRatio

const scrollHeightMultiplier = 10
const windowVideoHeightAndGap = videoHeight + windowVideoGap

const CollapsedVideo = ({ index, videoMediaStream }) => {
  const scale = interpolateRange(index, [0, stackSize], [1, stackScaleMin])

  const ref = useRef<HTMLVideoElement>(null)

  useVideoStream(ref.current, videoMediaStream)

  return (
    <div
      style={{
        zIndex: -index
      }}
      className={twMerge(
        `
          absolute
          transition-transform
          duration-200
        `
      )}
    >
      <div
        style={{
          height: `${videoHeight}rem`,
          width: `${videoWidth}rem`,
          transform: `translateY(${index * stackVideoGap}rem) scale(${scale})`
        }}
        className={twMerge(`origin-bottom`, videoStyles)}
      >
        <video ref={ref} />
      </div>
    </div>
  )
}

export const VideoCarousel = ({ handleSidebarOpen, videoElements, videoMediaStreams }) => {
  const [collapsed, setCollapsed] = useState(true)
  const [muted, setMuted] = useState(false)

  const [mounted, setMounted] = useState(false)

  const container = React.useRef<HTMLDivElement>(null)
  const videosRef = React.useRef<HTMLDivElement>(null)

  const _scrollYProgress = useRef(0)

  const { scrollYProgress } = useScroll({
    container: container
  })

  const numVideos = videoElements.length
  const showVideos = numVideos > 0

  const hasEnoughVideosForCarousel = numVideos > 1

  const showBottomButtons = !collapsed && hasEnoughVideosForCarousel

  const handleCollapsedVideosClick = useCallback(() => {
    if (!hasEnoughVideosForCarousel) {
      return
    }
    setCollapsed(false)
  }, [hasEnoughVideosForCarousel])

  const createVideos = useCallback(() => {
    if (!videosRef.current || !numVideos) {
      return
    }

    if (videosRef.current.children.length === numVideos) {
      return
    }
    console.log('creating')

    setMounted(true)

    const videos = videoElements.map((videoElement, i) => {
      const videoContainer = document.createElement('div')
      const video = document.createElement('div')

      videoContainer.className = `
        absolute
        transition-transform
        duration-200
      `

      video.className = videoStyles

      video.style.textShadow = `0 0.03em 0.08em hsla(0, 0%, 0%, 0.4)`

      video.style.height = `${videoHeight}rem`
      video.style.width = `${videoWidth}rem`

      video.appendChild(videoElement)

      videoContainer.appendChild(video)

      return videoContainer
    })

    videosRef.current.replaceChildren(...videos)
  }, [videosRef.current, numVideos])

  const positionVideos = useCallback(
    (latest = 0) => {
      if (!videosRef.current || !numVideos) {
        return
      }

      const minScroll = 1 / numVideos
      const maxScroll = (numVideos - (windowSize - 1)) / numVideos
      _scrollYProgress.current = Math.min(Math.max(latest, minScroll), maxScroll)

      const currentVideoIndex = Math.round(_scrollYProgress.current * numVideos)

      const windowTopIndex = Math.max(Math.floor(currentVideoIndex - halfWindowSize) + 1, 0)
      const windowBottomIndex = Math.max(Math.floor(currentVideoIndex + halfWindowSize), 0)

      const topStackTopIndex = Math.max(windowTopIndex - stackSize, 0)
      const topStackBottomIndex = windowTopIndex
      const bottomStackTopIndex = windowBottomIndex
      const bottomStackBottomIndex = windowBottomIndex + stackSize
      videoElements.map((__, i) => {
        if (!videosRef.current) {
          return
        }

        const videoContainerEl = videosRef.current.children?.[i] as HTMLElement

        if (!videoContainerEl) {
          return
        }

        const videoEl = videoContainerEl.children[0] as HTMLElement

        const above = i < windowTopIndex
        const below = i > windowBottomIndex

        const isWithinWindow = !above && !below

        const isInTopStack = i >= topStackTopIndex && i < topStackBottomIndex
        const isInBottomStack = i > bottomStackTopIndex && i <= bottomStackBottomIndex
        const visible = isWithinWindow || isInTopStack || isInBottomStack
        const hasTopStack = windowTopIndex > 0

        const indexWithinWindow = i - windowTopIndex
        const indexWithinTopStack = i - topStackTopIndex
        const indexWithinBottomStack = i - bottomStackTopIndex

        const paddingFromTopStack = hasTopStack
          ? Math.min(stackSize, Math.max(0, topStackBottomIndex)) * stackVideoGap
          : 0

        const paddingFromWindow =
          (Math.min(windowSize, windowBottomIndex + 1) - (isInBottomStack ? 1 : 0)) * windowVideoHeightAndGap

        const translateY = isInTopStack
          ? indexWithinTopStack * stackVideoGap
          : isWithinWindow
          ? paddingFromTopStack + indexWithinWindow * windowVideoHeightAndGap
          : isInBottomStack
          ? paddingFromTopStack + paddingFromWindow + indexWithinBottomStack * stackVideoGap
          : 0

        const percentIntoTopStack = (stackSize - (topStackBottomIndex - i)) / stackSize
        const percentIntoBottomStack = (bottomStackBottomIndex - i) / stackSize

        const topStackScale = interpolateRange(percentIntoTopStack, [1, 0], [1, stackScaleMin])
        const bottomStackScale = interpolateRange(percentIntoBottomStack, [1, 0], [1, stackScaleMin])

        const scale = isWithinWindow ? `1.0` : isInTopStack ? topStackScale : isInBottomStack ? bottomStackScale : `1.0`
        videoContainerEl.style.display = visible ? `block` : `none`

        videoContainerEl.style.transform = `translateY(${translateY}rem)`

        videoEl.style.transformOrigin = isInTopStack
          ? `top center`
          : isWithinWindow
          ? `center center`
          : isInBottomStack
          ? `bottom center`
          : ``

        videoEl.style.transform = `scale(${scale})`

        const withBottomZIndexOverlap = i === windowBottomIndex ? windowBottomIndex - 2 : windowBottomIndex - 1

        videoContainerEl.style.zIndex = isInBottomStack
          ? `${-indexWithinBottomStack}`
          : isWithinWindow
          ? `${withBottomZIndexOverlap}`
          : `${i}`
      })
    },
    [videosRef.current, numVideos]
  )

  const positionVideosWithCollapsed = useCallback(
    (latest = 0) => {
      if (collapsed) {
        return
      }

      positionVideos(latest)
    },
    [collapsed]
  )
  useMotionValueEvent(scrollYProgress, 'change', positionVideosWithCollapsed)
  useMotionValueEvent(scrollYProgress, 'renderRequest', positionVideosWithCollapsed)

  useLayoutEffect(() => {
    if (!container.current || !videosRef.current || !numVideos) {
      return
    }

    createVideos()
    positionVideos(0)
  }, [container.current, videosRef.current, numVideos])

  const collapsedVideos = videoElements
    .filter((__, i) => {
      return i <= stackSize
    })
    .reverse()
    .map((__, i) => {
      return <CollapsedVideo videoMediaStream={videoMediaStreams[i]} key={i} index={i} />
    })

  const scrollHeight = (numVideos - (windowSize - 1)) * scrollHeightMultiplier
  const collapsedVideosListHeight = videoHeight + stackSize * stackVideoGap
  const openVideosListHeight = numVideos > 4 ? 25.7 : Math.min(numVideos, 4) * windowVideoHeightAndGap

  const videosListHeight = showVideos ? (collapsed ? collapsedVideosListHeight : openVideosListHeight) : 0

  return (
    <div className={containerStyles}>
      <div
        ref={container}
        style={{
          height: `${videosListHeight}rem`
        }}
        className={twMerge(videosListStyles)}
      >
        {showVideos ? (
          <>
            <button
              style={{
                height: `${videoHeight}rem`,
                width: `${videoWidth}rem`
              }}
              onClick={handleCollapsedVideosClick}
              className={twMerge(collapsedVideosStyles, collapsed ? `` : `hidden`)}
            >
              {collapsedVideos}
            </button>
            <>
              <div
                onClick={() => setCollapsed(true)}
                ref={videosRef}
                className={twMerge(videosStyles, collapsed ? `hidden` : ``)}
              />
              <div
                style={{
                  height: `${scrollHeight}rem`,
                  width: `${videoWidth}rem`
                }}
              />
            </>
          </>
        ) : (
          <></>
        )}
      </div>
      {showBottomButtons ? (
        <div className={bottomButtonsStyles}>
          <IconButton onClick={() => setMuted((prev) => !prev)}>{muted ? <VolumeXMd /> : <VolumeMinMd />}</IconButton>
          <IconButton onClick={handleSidebarOpen}>
            <Expand01Md />
          </IconButton>
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
