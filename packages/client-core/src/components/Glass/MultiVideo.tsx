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

import { largeIconButtonStyles } from './Buttons'

function interpolateRange(value, [fromMax, fromMin], [toMax, toMin]) {
  const normalized = (value - fromMin) / (fromMax - fromMin)
  const toRange = toMax - toMin

  return toMin + normalized * toRange
}

const multiVideoContainerStyles = `
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
  rounded-xl
  border-2
  border-white/90
  bg-white/10
  backdrop-blur-3xl
  text-xl
  font-bold
  text-white
  transition-transform
  duration-150
`

const collapsedVideosStyles = `
  sticky top-0
  z-10
  flex
  cursor-pointer
`

const multiVideoButtonsStyles = `
  flex
  justify-between
`

export const MultiVideos = ({ handleSidebarOpen }) => {
  const [list, setList] = useState([...Array(40)])
  const [collapsed, setCollapsed] = useState(true)
  const [muted, setMuted] = useState(false)

  const container = React.useRef<HTMLDivElement>(null)
  const videosRef = React.useRef<HTMLDivElement>(null)

  const _scrollYProgress = useRef(0)

  const { scrollYProgress } = useScroll({
    container: container
  })

  const perVideoPercent = list.length && 1 / list.length
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

  const createVideos = useCallback(() => {
    if (!videosRef.current) {
      return
    }

    const videos = list.map((__, i) => {
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

      video.innerHTML = `${i}`

      videoContainer.appendChild(video)

      return videoContainer
    })

    videosRef.current.replaceChildren(...videos)
  }, [videosRef.current, list.length])

  const positionVideos = useCallback(
    (latest = 0) => {
      if (!videosRef.current) {
        return
      }

      const minScroll = 1 / list.length
      const maxScroll = (list.length - (windowSize - 1)) / list.length
      _scrollYProgress.current = Math.min(Math.max(latest, minScroll), maxScroll)

      const currentVideoIndex = Math.round(_scrollYProgress.current * list.length)

      const windowTopIndex = Math.max(Math.floor(currentVideoIndex - halfWindowSize) + 1, 0)
      const windowBottomIndex = Math.max(Math.floor(currentVideoIndex + halfWindowSize), 0)

      const topStackTopIndex = Math.max(windowTopIndex - stackSize, 0)
      const topStackBottomIndex = windowTopIndex
      const bottomStackTopIndex = windowBottomIndex
      const bottomStackBottomIndex = windowBottomIndex + stackSize
      list.map((__, i) => {
        if (!videosRef.current) {
          return
        }

        const videoContainerEl = videosRef.current.children[i] as HTMLElement
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
    [videosRef.current, list.length]
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
    if (!container.current || !videosRef.current || !list.length) {
      return
    }

    createVideos()
    positionVideos(0)
  }, [container.current, videosRef.current, list.length])

  const CollapsedVideo = ({ id }) => {
    const scale = interpolateRange(id, [0, stackSize], [1, stackScaleMin])

    return (
      <div
        style={{
          zIndex: -id
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
            transform: `translateY(${id * stackVideoGap}rem) scale(${scale})`
          }}
          className={twMerge(`origin-bottom`, videoStyles)}
        >
          {id}
        </div>
      </div>
    )
  }

  const collapsedVideos = list
    .filter((__, i) => {
      return i <= stackSize
    })
    .reverse()
    .map((__, i) => {
      return <CollapsedVideo key={i} id={i} />
    })

  const scrollHeight = (list.length - (windowSize - 1)) * scrollHeightMultiplier
  const videosListHeight = videoHeight + stackSize * stackVideoGap

  return (
    <div className={multiVideoContainerStyles}>
      <div
        ref={container}
        style={{
          height: collapsed ? `${videosListHeight}rem` : `25.7rem`
        }}
        className={twMerge(videosListStyles)}
      >
        <button
          style={{
            height: `${videoHeight}rem`,
            width: `${videoWidth}rem`
          }}
          onClick={() => setCollapsed((prev) => false)}
          className={twMerge(collapsedVideosStyles, collapsed ? `` : `hidden`)}
        >
          {collapsedVideos}
        </button>
        <>
          <div
            onClick={() => setCollapsed((prev) => true)}
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
      </div>
      {collapsed ? (
        <></>
      ) : (
        <div className={multiVideoButtonsStyles}>
          <button onClick={() => setMuted((prev) => !prev)} className={twMerge(largeIconButtonStyles, ``)}>
            {muted ? <VolumeXMd /> : <VolumeMinMd />}
          </button>
          <button onClick={handleSidebarOpen} className={twMerge(largeIconButtonStyles, ``)}>
            <Expand01Md />
          </button>
        </div>
      )}
    </div>
  )
}
