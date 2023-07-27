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

export const VIDEO_CONSTRAINTS = {
  qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
  vga: { width: { ideal: 640 }, height: { ideal: 480 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
  fhd: { width: { ideal: 1920 }, height: { ideal: 1080 } }
}

export const localAudioConstraints: MediaStreamConstraints = {
  audio: {
    autoGainControl: true,
    echoCancellation: true,
    noiseSuppression: true
  }
}

export const localVideoConstraints: MediaStreamConstraints = {
  video: {
    width: VIDEO_CONSTRAINTS.fhd.width,
    height: VIDEO_CONSTRAINTS.fhd.height,
    frameRate: { max: 60 }
  }
}

export const CAM_VIDEO_SIMULCAST_ENCODINGS = [
  { scaleResolutionDownBy: 4, maxBitrate: 500 * 1000 }, // 500kbps
  { scaleResolutionDownBy: 2, maxBitrate: 1000 * 1000 }, // 1mbps
  { scaleResolutionDownBy: 1, maxBitrate: 10 * 1000 * 1000 } // 10mbps
]

export const CAM_VIDEO_SIMULCAST_CODEC_OPTIONS = {
  videoGoogleStartBitrate: 1000, // 1mbps
  videoGoogleMaxBitrate: 1000 * 1000, // 1gbps
  videoGoogleMinBitrate: 1 // 1kbps
}

export const SCREEN_SHARE_SIMULCAST_ENCODINGS = [
  { dtx: true, maxBitrate: 500 * 1000 }, // 500kbps
  { dtx: true, maxBitrate: 2 * 1000 * 1000 }, // 2mbps
  { dtx: true, maxBitrate: 10 * 1000 * 1000 } // 10mbps
]
