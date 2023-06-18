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

import { AnimationAction } from 'three'

import { lerp } from '../../common/functions/MathLerpFunctions'

/**
 * Updates animation action time
 * based on distance traveled by avatar
 */
export type DistanceMatchingAction = {
  action: AnimationAction
  distanceTrack: any
  distanceTraveled: number
}

const _wrapNumber = (value: number, max: number) => value % max

export function updateDistanceMatchingAction(dma: DistanceMatchingAction, speed: number) {
  if (speed === 0) return
  const maxDist = getMaxDistanceFromDistanceTrack(dma.distanceTrack)
  dma.distanceTraveled = _wrapNumber(dma.distanceTraveled + speed, maxDist)
  dma.action.time = findTimeFromDistanceTrack(dma.distanceTrack, dma.distanceTraveled)
}

export function updateFollowerAction(dma: DistanceMatchingAction, otherAction: DistanceMatchingAction) {
  const timeRatio = otherAction.action.getClip().duration / dma.action.getClip().duration
  setTime(otherAction, dma.action.time * timeRatio)
}

function setTime(dma: DistanceMatchingAction, time: number) {
  dma.action.time = time
  dma.distanceTraveled = findDistanceFromDistanceTrack(dma.distanceTrack, time)
}

export const getMaxDistanceFromDistanceTrack = (track): number => track.values[track.values.length - 1]

export const findTimeFromDistanceTrack = (track, distance: number) => {
  const values = track.values,
    times = track.times

  let first = 1,
    last = track.times.length - 1,
    count = last - first

  while (count > 0) {
    const step = Math.floor(count / 2),
      middle = first + step

    if (distance > values[middle]) {
      first = middle + 1
      count -= step + 1
    } else {
      count = step
    }
  }

  const distA = values[first - 1],
    distB = values[first],
    diff = distB - distA,
    alpha = diff < 0.00001 ? 0.0 : (distance - distA) / diff

  return lerp(times[first - 1], times[first], alpha)
}

export const findDistanceFromDistanceTrack = (track, time: number) => {
  const values = track.values,
    times = track.times

  let first = 1,
    last = track.times.length - 1,
    count = last - first

  while (count > 0) {
    const step = Math.floor(count / 2),
      middle = first + step

    if (time > times[middle]) {
      first = middle + 1
      count -= step + 1
    } else {
      count = step
    }
  }

  const timeA = times[first - 1],
    timeB = times[first],
    diff = timeB - timeA,
    alpha = diff < 0.00001 ? 0.0 : (time - timeA) / diff

  return lerp(values[first - 1], values[first], alpha)
}
