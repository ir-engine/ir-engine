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

import { ArrowsRightLeftIcon } from '@heroicons/react/20/solid'
import { CameraIcon, CogIcon } from '@heroicons/react/24/solid'
import React from 'react'
import { twMerge } from 'tailwind-merge'

import LoadingCircle from '@etherealengine/ui/src/primitives/tailwind/LoadingCircle'

import Button from '../../../primitives/tailwind/Button'

/**
 * Props for Toolbar component
 */
export interface ToolbarProps {
  className: string // CSS class for styling the toolbar
  showLabels: boolean // Flag indicating if labels should be shown
  buttonSize: string // Size of the icons
  toggleDetecting: () => void // Function to toggle detecting
  toggleWebcam: () => void // Function to toggle webcam
  videoStatus: string // Status of the video
  detectingStatus: string // Status of detecting
  isRecording: boolean // Flag indicating if recording is active
  recordingStatus: string | null // Status of the recording
  onToggleRecording: () => void // Function to toggle recording
  isVideoFlipped: boolean // Flag indicating if video is flipped
  flipVideo: (val: boolean) => void // Function to flip the video
  cycleCamera: () => void // Function to cycle the camera
  drawBody: (val: boolean) => void // Function to toggle drawing body
  isDrawingBody: boolean // Flag indicating if drawing body is active
  drawFace: (val: boolean) => void // Function to toggle drawing face
  isDrawingFace: boolean // Flag indicating if drawing face is active
  drawHands: (val: boolean) => void // Function to toggle drawing hands
  isDrawingHands: boolean // Flag indicating if drawing hands is active
}

/**
 * Toolbar component
 */
const Toolbar = ({
  className,
  showLabels,
  buttonSize,
  toggleDetecting,
  toggleWebcam,
  videoStatus,
  detectingStatus,
  isRecording,
  recordingStatus,
  onToggleRecording,
  isVideoFlipped,
  flipVideo,
  cycleCamera,
  drawBody,
  isDrawingBody,
  drawFace,
  isDrawingFace,
  drawHands,
  isDrawingHands
}: ToolbarProps) => {
  /**
   * Renders the Toolbar component.
   */
  return (
    <nav className={twMerge('navbar border-solid w-full', className)}>
      <div className="flex-1">
        <div className="btn-group">
          <Button
            {...(videoStatus !== 'active' ? { disabled: true } : {})}
            className={twMerge(
              'btn',
              detectingStatus === 'active' && videoStatus === 'active' ? 'btn-active' : '',
              buttonSize === 'lg' ? 'btn-lg' : '',
              buttonSize === 'sm' ? 'btn-sm' : ''
            )}
            onClick={toggleDetecting}
            icon={
              detectingStatus === 'loading' ? (
                <LoadingCircle className={`block w-6 h-6 top-0`} />
              ) : (
                <svg
                  className={`block w-6 h-6`}
                  version="1.0"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20pt"
                  height="20pt"
                  viewBox="0 0 200.000000 200.000000"
                  preserveAspectRatio="xMinYMin meet"
                >
                  <g
                    transform="translate(0.000000,200.000000) scale(0.100000,-0.100000)"
                    fill="currentColor"
                    stroke="none"
                  >
                    <path
                      d="M108 1869 c-16 -9 -18 -28 -18 -172 0 -114 4 -167 12 -175 7 -7 31
-12 55 -12 56 0 63 15 63 139 l0 101 108 0 c71 0 112 4 120 12 16 16 16 90 0
106 -15 15 -315 16 -340 1z"
                    />
                    <path
                      d="M1522 1868 c-7 -7 -12 -30 -12 -53 0 -23 5 -46 12 -53 8 -8 49 -12
120 -12 l108 0 0 -108 c0 -71 4 -112 12 -120 7 -7 30 -12 53 -12 23 0 46 5 53
12 8 8 12 60 12 169 0 130 -3 160 -16 173 -13 13 -43 16 -173 16 -109 0 -161
-4 -169 -12z"
                    />
                    <path
                      d="M924 1621 c-81 -37 -108 -107 -79 -208 18 -60 77 -133 109 -133 26 0
23 113 -4 140 -11 11 -20 27 -20 35 0 19 36 55 55 55 8 0 24 -9 36 -21 22 -22
19 -55 -7 -75 -20 -16 -20 -134 0 -134 25 0 78 53 97 95 47 108 24 200 -61
243 -53 27 -73 27 -126 3z"
                    />
                    <path
                      d="M816 1223 c-772 -90 -769 -90 -788 -113 -24 -30 -23 -53 5 -85 l22
-26 318 -7 c198 -5 321 -12 328 -19 5 -5 26 -145 46 -309 25 -213 40 -304 51
-316 13 -16 36 -18 187 -18 148 0 175 2 186 16 9 11 27 125 50 316 20 165 42
305 48 311 7 7 118 13 328 19 296 7 318 9 337 27 23 24 26 76 4 98 -12 11
-109 26 -389 59 -358 43 -479 53 -544 45 -16 -2 -57 -1 -90 2 -33 3 -78 3 -99
0z m209 -97 c18 -27 11 -55 -19 -65 -50 -19 -89 22 -61 65 20 31 59 32 80 0z
m-413 -21 c23 -51 -53 -90 -86 -44 -25 36 -3 69 47 69 20 0 31 -7 39 -25z
m-392 1 c15 -19 9 -56 -11 -69 -9 -5 -28 -7 -42 -3 -31 7 -46 48 -27 71 16 19
64 19 80 1z m1290 0 c15 -19 9 -56 -11 -69 -9 -5 -28 -7 -42 -3 -31 7 -46 48
-27 71 16 19 64 19 80 1z m-600 -11 c0 -13 -22 -15 -135 -15 -113 0 -135 2
-135 15 0 13 22 15 135 15 113 0 135 -2 135 -15z m378 8 c84 -4 112 -9 112
-20 0 -15 -25 -16 -212 -6 -97 5 -128 9 -128 20 0 15 51 17 228 6z m546 -15
c13 -19 14 -25 2 -43 -18 -26 -53 -31 -77 -9 -23 21 -24 37 -3 58 22 23 60 20
78 -6z m-1344 -2 c0 -18 -221 -31 -232 -13 -10 16 35 24 145 26 67 1 87 -2 87
-13z m1193 -2 c23 -4 37 -12 37 -22 0 -12 -9 -13 -46 -8 -26 3 -66 6 -90 6
-34 0 -42 3 -38 15 7 16 67 20 137 9z m-683 -294 c0 -207 -2 -240 -15 -240
-13 0 -15 33 -15 240 0 207 2 240 15 240 13 0 15 -33 15 -240z m20 -280 c11
-11 20 -24 20 -30 0 -15 -38 -50 -55 -50 -17 0 -55 35 -55 50 0 15 38 50 55
50 8 0 24 -9 35 -20z"
                    />
                    <path
                      d="M102 448 c-17 -17 -17 -329 0 -346 17 -17 329 -17 346 0 7 7 12 31
12 55 0 56 -15 63 -139 63 l-101 0 0 101 c0 124 -7 139 -63 139 -24 0 -48 -5
-55 -12z"
                    />
                    <path
                      d="M1762 448 c-8 -8 -12 -49 -12 -120 l0 -108 -101 0 c-124 0 -139 -7
-139 -63 0 -24 5 -48 12 -55 8 -8 61 -12 175 -12 150 0 163 1 173 19 15 29 13
324 -2 339 -7 7 -30 12 -53 12 -23 0 -46 -5 -53 -12z"
                    />
                  </g>
                </svg>
              )
            }
            showLabel={showLabels}
            labelPosition="below"
            title="pose"
          />
          <Button
            {...(detectingStatus !== 'active' ? { disabled: true } : {})}
            className={twMerge(
              'btn',
              isRecording && 'btn-active',
              buttonSize === 'lg' ? 'btn-lg' : '',
              buttonSize === 'sm' ? 'btn-sm' : ''
            )}
            onClick={onToggleRecording}
            icon={
              detectingStatus !== 'active' ? (
                <div className={twMerge('badge badge-xs badge-warning opacity-50', `w-6 h-6`)}></div>
              ) : (
                <div
                  className={twMerge(
                    'badge badge-xs badge-warning',
                    `w-6 h-6`,
                    isRecording && 'animate-pulse badge-error'
                  )}
                ></div>
              )
            }
            showLabel={true}
            labelPosition="right"
            title={recordingStatus === 'inactive' ? 'Record' : recordingStatus === 'ready' ? 'Record' : 'Recording'}
          />
        </div>
      </div>
      <div className="navbar-end">
        <div className="btn-group">
          <Button
            {...(videoStatus !== 'active' ? { disabled: true } : {})}
            className={twMerge('btn', buttonSize === 'lg' ? 'btn-lg' : '', buttonSize === 'sm' ? 'btn-sm' : '')}
            onClick={cycleCamera}
            icon={<ArrowsRightLeftIcon className={`block w-6 h-6`} />}
            showLabel={showLabels}
            title="Cycle"
            labelPosition="below"
          />
          <Button
            {...(videoStatus === 'loading' ? { disabled: true } : {})}
            className={twMerge(
              'btn',
              videoStatus === 'active' && 'btn-active',
              buttonSize === 'lg' ? 'btn-lg' : '',
              buttonSize === 'sm' ? 'btn-sm' : ''
            )}
            onClick={toggleWebcam}
            icon={
              videoStatus === 'loading' ? (
                <LoadingCircle className={`block w-6 h-6`} />
              ) : (
                <CameraIcon className={`block w-6 h-6`} />
              )
            }
            title="Camera"
            showLabel={showLabels}
            labelPosition="below"
          />
        </div>
        <div className="dropdown dropdown-top dropdown-end">
          <ul className="dropdown-content menu bg-base-100 p-2 rounded-box w-80">
            <li>
              <label className="label cursor-pointer">
                <span className="label-text whitespace-nowrap">Mirror Video</span>
                <input
                  type="checkbox"
                  className="toggle"
                  defaultChecked={isVideoFlipped}
                  onChange={(e) => {
                    flipVideo(e.target.checked)
                  }}
                />
              </label>
            </li>
            <li>
              <label className="label cursor-pointer">
                <span className="label-text whitespace-nowrap">Draw Body</span>
                <input
                  type="checkbox"
                  className="toggle"
                  defaultChecked={isDrawingBody}
                  onChange={(e) => {
                    drawBody(e.target.checked)
                  }}
                />
              </label>
            </li>
            <li>
              <label className="label cursor-pointer">
                <span className="label-text whitespace-nowrap">Draw Hands</span>
                <input
                  type="checkbox"
                  className="toggle"
                  defaultChecked={isDrawingHands}
                  onChange={(e) => {
                    drawHands(e.target.checked)
                  }}
                />
              </label>
            </li>
            <li>
              <label className="label cursor-pointer">
                <span className="label-text whitespace-nowrap">Draw Face</span>
                <input
                  type="checkbox"
                  className="toggle"
                  defaultChecked={isDrawingFace}
                  onChange={(e) => {
                    drawFace(e.target.checked)
                  }}
                />
              </label>
            </li>
          </ul>
          <Button
            {...(videoStatus !== 'active' ? { disabled: true } : {})}
            className={twMerge('btn', buttonSize === 'lg' ? 'btn-lg' : '', buttonSize === 'sm' ? 'btn-sm' : '')}
            icon={<CogIcon className={`block w-6 h-6`} />}
            title="Settings"
            showLabel={showLabels}
            labelPosition="below"
          />
        </div>
      </div>
    </nav>
  )
}

Toolbar.defaultProps = {
  className: '',
  showLabels: false,
  buttonSize: 'md', // sm, md, lg
  toggleDetecting: () => {},
  toggleWebcam: () => {},
  videoStatus: 'loading',
  detectingStatus: 'inactive',
  isRecording: false,
  recordingStatus: undefined,
  onToggleRecording: () => {},
  isVideoFlipped: true,
  flipVideo: () => {},
  cycleCamera: () => {},
  drawBody: () => {},
  isDrawingBody: true,
  drawFace: () => {},
  isDrawingFace: true,
  drawHands: () => {},
  isDrawingHands: true
}

export default Toolbar
