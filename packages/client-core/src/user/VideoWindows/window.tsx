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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { State, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import { PeerMediaChannelState, PeerMediaStreamInterface } from '@ir-engine/network/src/media/PeerMediaChannelState'
import { ArrowTopRightOnSquareSm, Microphone01Lg, MicrophoneOff, VolumeMaxLg, VolumeXLg } from '@ir-engine/ui/src/icons'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Canvas from '@ir-engine/ui/src/primitives/tailwind/Canvas'
import React, { useEffect, useRef } from 'react'

import { useClickOutside, useTouchOutside } from '@ir-engine/common/src/utils/useClickOutside'
import { useTranslation } from 'react-i18next'
import { ReportUserState } from '../../util/ReportUserState'
import { Props, useUserMediaWindowHook } from './hook'

export const SingleVideoWindow = ({ peerID, type }: Props): JSX.Element => {
  const { isSelf, isPiP, isScreen, videoMediaStream, avatarThumbnail, videoStreamPaused, togglePiP } =
    useUserMediaWindowHook({
      peerID,
      type
    })

  const { t } = useTranslation()
  const peerMediaChannelState = useHookstate(
    getMutableState(PeerMediaChannelState)[peerID][type] as State<PeerMediaStreamInterface>
  )

  const { videoElement, audioElement } = peerMediaChannelState.value as PeerMediaStreamInterface

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const canvasCtxRef = useRef<CanvasRenderingContext2D>()
  const isMoreButtonVisible = useHookstate(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // @todo - currently this adds lots of systems unnecessarily
  // useDrawMocapLandmarks(videoElement, canvasCtxRef, canvasRef, peerID)

  useEffect(() => {
    videoElement.draggable = false
    document.getElementById(peerID + '-' + type + '-video-container')?.append(videoElement)
    document.getElementById(peerID + '-' + type + '-audio-container')?.append(audioElement)
  }, [])

  useEffect(() => {
    videoElement.style.transform = isSelf ? 'scaleX(-1)' : 'scaleX(1)'
  }, [isSelf])

  useEffect(() => {
    if (canvasRef.current && canvasRef.current.width !== videoElement.clientWidth) {
      canvasRef.current.width = videoElement.clientWidth
    }

    if (canvasRef.current && canvasRef.current.height !== videoElement.clientHeight) {
      canvasRef.current.height = videoElement.clientHeight
    }

    if (canvasRef.current) canvasCtxRef.current = canvasRef.current.getContext('2d')!
  })

  useClickOutside(containerRef, () => isMoreButtonVisible.set(false))
  useTouchOutside(containerRef, () => isMoreButtonVisible.set(false))

  return (
    <div className="group/video-window flex items-center gap-x-2" ref={containerRef}>
      <div
        tabIndex={0}
        id={peerID + '_' + type + '_container'}
        className={`pointer-events-auto relative h-[80px] w-[80px] overflow-hidden rounded-[90px] lg:h-[131px] lg:w-[131px] ${
          (!videoMediaStream || videoStreamPaused) && 'hidden lg:block'
        }`}
        onClick={() => {
          if (isScreen && isPiP) togglePiP()
        }}
        onMouseOver={() => isMoreButtonVisible.set((prev) => !prev)}
      >
        {(!videoMediaStream || videoStreamPaused) && (
          <img
            src={avatarThumbnail}
            alt={t('user:avatar.avatar')}
            crossOrigin="anonymous"
            draggable={false}
            className="bg-[radial-gradient(circle,_#DDDDDD,_#726B65)]"
          />
        )}
        <span
          className="[&>video]:h-full [&>video]:w-full [&>video]:object-cover"
          key={peerID + '-' + type + '-video-container'}
          id={peerID + '-' + type + '-video-container'}
        />
        <div className="pointer-events-none absolute top-0 h-full w-full">
          <Canvas ref={canvasRef} />
        </div>
        <span key={peerID + '-' + type + '-audio-container'} id={peerID + '-' + type + '-audio-container'} />
      </div>
      {!isSelf && (
        <Button
          variant="primary"
          size="sm"
          className={`hidden lg:group-hover/video-window:flex ${isMoreButtonVisible.value ? 'flex' : ''}`}
          onClick={() => {
            isMoreButtonVisible.set(false)
            ReportUserState.setReportedPeerId(peerID)
          }}
        >
          {t('user:videoWindows.more')}
          <ArrowTopRightOnSquareSm />
        </Button>
      )}
    </div>
  )
}

export const SingleVideoWindowWidget = ({ peerID, type }: Props): JSX.Element => {
  const { username, isSelf, videoMediaStream, avatarThumbnail, videoStreamPaused, audioStreamPaused, toggleAudio } =
    useUserMediaWindowHook({ peerID, type })

  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!ref.current || ref.current.srcObject || !videoMediaStream) return

    ref.current.id = `${peerID}_video_xrui`
    ref.current.autoplay = true
    ref.current.muted = true
    ref.current.setAttribute('playsinline', 'true')

    const newVideoTrack = videoMediaStream.getVideoTracks()[0].clone()
    ref.current.srcObject = new MediaStream([newVideoTrack])
    ref.current.play()
  }, [ref.current, videoMediaStream])

  return (
    <div
      style={{
        height: '100px',
        width: '100px',
        background: 'white',
        // borderRadius: '50px', // todo - fix video overflow to make round - see if we can replace the geometry of the layer with a circle geom
        border: '3px solid var(--iconButtonSelectedBackground)',
        overflow: 'hidden'
      }}
      xr-layer="true"
    >
      {!videoMediaStream || videoStreamPaused ? (
        <img
          style={{
            height: 'auto',
            maxWidth: '100%'
          }}
          src={avatarThumbnail}
          alt=""
          crossOrigin="anonymous"
          draggable={false}
          xr-layer="true"
        />
      ) : (
        <video
          xr-layer="true"
          style={{ height: 'auto', maxWidth: '100px' }}
          ref={ref}
          key={peerID + '-video-container'}
          id={peerID + '-video-container-xrui'}
        />
      )}
      <div
        style={{
          fontFamily: 'var(--lato)',
          textAlign: 'center',
          width: '100%',
          margin: '14px 0',
          color: 'var(--textColor)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
        xr-layer="true"
      >
        {username}
        <button style={{ margin: 0 }} onClick={toggleAudio} xr-layer="true">
          {isSelf ? (
            audioStreamPaused ? (
              <MicrophoneOff />
            ) : (
              <Microphone01Lg />
            )
          ) : audioStreamPaused ? (
            <VolumeXLg />
          ) : (
            <VolumeMaxLg />
          )}
        </button>
      </div>
    </div>
  )
}
