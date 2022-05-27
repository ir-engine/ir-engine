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
