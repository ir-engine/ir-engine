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

import { LandmarkList, NormalizedLandmarkList, Results } from '@mediapipe/pose'

const frameSets: NormalizedLandmarkList[][] = [[], []]
const smoothFrame: NormalizedLandmarkList[] = [[], []]

type MotionCaptureResults = {
  poseWorldLandmarks: NormalizedLandmarkList
  poseLandmarks: LandmarkList
}
type MotionCaptureTimeseries = {
  timestamp: number
  results: MotionCaptureResults
}
const interpolateData = (data: MotionCaptureTimeseries, lastData?: MotionCaptureTimeseries, alpha = 0.5): void => {
  if (!lastData) return
  if (!data) return
  const length = data.results.poseWorldLandmarks.length
  const list = ['poseLandmarks', 'poseWorldLandmarks']
  for (let i = 0; i < list.length; i++) {
    for (let j = 0; j < length; j++) {
      const x = data.results[list[i]][j].x
      const y = data.results[list[i]][j].y
      const z = data.results[list[i]][j].z
      const x1 = lastData.results[list[i]][j].x
      const y1 = lastData.results[list[i]][j].y
      const z1 = lastData.results[list[i]][j].z
      data.results[list[i]][j].x += (x1 - x) * alpha
      data.results[list[i]][j].y += (y1 - y) * alpha
      data.results[list[i]][j].z += (z1 - z) * alpha
    }
  }
}

// Average N amount of frames
const smoothLandmarks = (results: Results, frames: number): Results => {
  // Pushing frame at the end of frameSet array
  if (results.poseLandmarks && results.poseWorldLandmarks) {
    frameSets[0].push(results.poseLandmarks)
    frameSets[1].push(results.poseWorldLandmarks)
  }

  if (frameSets[0].length === frames && frameSets[1].length === frames) {
    // This loop will run 33 time to make average of each joint
    for (let j = 0; j < 2; j++) {
      for (let i = 0; i < 33; i++) {
        // Making an array of each joint coordinates
        let x = frameSets[j].map((a) => a[i].x)
        let y = frameSets[j].map((a) => a[i].y)
        let z = frameSets[j].map((a) => a[i].z)
        let visibility = frameSets[j].map((a) => a[i].visibility || 0)

        // Sorting the array into ascending order
        x = x.sort((a, b) => a - b)
        y = y.sort((a, b) => a - b)
        z = z.sort((a, b) => a - b)
        visibility = visibility.sort((a, b) => a - b)

        // Dropping 2 min and 2 max coordinates
        if (frames >= 8) {
          x = x.slice(2, 6)
          y = y.slice(2, 6)
          z = z.slice(2, 6)
          visibility = visibility.slice(2, 6)
        }

        // Making the average of remaining coordinates
        smoothFrame[j][i] = {
          x: x.reduce((a, b) => a + b, 0) / x.length,
          y: y.reduce((a, b) => a + b, 0) / y.length,
          z: z.reduce((a, b) => a + b, 0) / z.length,
          visibility: visibility.reduce((a, b) => a + b, 0) / visibility.length
        }
      }
    }

    // Removing the first frame from frameSet
    frameSets[0].shift()
    frameSets[1].shift()
  }

  // after first 8 frames we have averaged coordinates, So now updating the poseLandmarks with averaged coordinates
  if (smoothFrame[0].length > 0) {
    results.poseLandmarks = smoothFrame[0]
  }
  if (smoothFrame[1].length > 0) {
    results.poseWorldLandmarks = smoothFrame[1]
  }

  return results
}

export default smoothLandmarks
