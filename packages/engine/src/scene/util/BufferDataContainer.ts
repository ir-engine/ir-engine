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

export type BufferedDataType = {
  startTime: number // in custom timeUnits
  endTime: number // in custom timeUnits
  fetchTime: number // in seconds
}[]

export type PendingBufferDataType = {
  startTime: number
  endTime: number
}[]

export type CommonBufferDataType = {
  startTime: number
  endTime: number
}[]

export default class BufferData {
  private bufferedRange: BufferedDataType
  private pendingRange: PendingBufferDataType
  private metrics: {
    totalFetchTime: number
    totalPlayTime: number
  }

  constructor() {
    this.bufferedRange = []
    this.pendingRange = []
    this.metrics = {
      totalFetchTime: 0,
      totalPlayTime: 0
    }
  }

  /**
   * Returns the greatest index in the array such that array[index] <= value
   */
  private lowerBound(array: CommonBufferDataType, value: number, property: 'startTime' | 'endTime' = 'startTime') {
    const length = array.length
    let low = 0,
      high = length - 1,
      index = -1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (array[mid][property] <= value) {
        index = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    return index
  }

  /**
   * Returns the smallest index in the array such that array[index] > value
   */
  private upperBound(array: CommonBufferDataType, value: number, property: 'startTime' | 'endTime' = 'endTime') {
    const length = array.length
    let low = 0,
      high = length - 1,
      index = -1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (array[mid][property] > value) {
        index = mid
        high = mid - 1
      } else {
        low = mid + 1
      }
    }

    return index
  }

  /**
   * Merges the buffered range with the existing buffered ranges.
   * Eg: [0, 10], [10, 20], [20, 25], [30, 40]
   * Calling updateEndTime(0) on above ranges will merge [0, 10] with [10, 20] and [20, 25]
   * resulting in [0, 25], [30, 40]
   *
   */
  private updateEndTime(index: number, pending = false) {
    const array = pending ? this.pendingRange : this.bufferedRange

    const length = array.length

    // if index is out of bounds or the range is pending, Do not merge the range with others
    if (index < 0 || index >= length) return

    let i = index + 1
    while (i < length && array[index].endTime >= array[i].startTime) {
      array[index].endTime = Math.max(array[index].endTime, array[i].endTime)

      if (!pending) {
        this.bufferedRange[index].fetchTime = this.bufferedRange[index].fetchTime + this.bufferedRange[i].fetchTime
      }

      i++
    }

    array.splice(index + 1, i - 1 - index)
  }

  public addBufferedRange(startTime: number, endTime: number, fetchTime: number) {
    this.removePendingRange(startTime, endTime)
    this.addRange(startTime, endTime, fetchTime, false)
  }

  public addPendingRange(startTime: number, endTime: number) {
    this.removeBufferedRange(startTime, endTime)
    this.addRange(startTime, endTime, 0, true)
  }

  private addRange(startTime: number, endTime: number, fetchTime: number, pending: boolean) {
    const array = pending ? this.pendingRange : this.bufferedRange
    if (startTime >= endTime) {
      return
    }

    if (!pending) {
      this.metrics.totalFetchTime += fetchTime
      this.metrics.totalPlayTime += endTime - startTime
    }

    const length = array.length

    const lb = this.lowerBound(array, startTime)
    if (lb === -1) {
      array.unshift({ startTime, endTime })
      if (!pending) {
        ;(array as BufferedDataType)[0].fetchTime = fetchTime
      }

      this.updateEndTime(0)
      return
    }

    if (startTime > array[lb].endTime) {
      // Both the conditions do the same thing, but the first one is faster
      if (lb === length - 1) {
        array.push({ startTime, endTime })
        if (!pending) {
          ;(array as BufferedDataType)[length].fetchTime = fetchTime
        }
      } else {
        array.splice(lb + 1, 0, { startTime, endTime })
        if (!pending) {
          ;(array as BufferedDataType)[lb + 1].fetchTime = fetchTime
        }
        this.updateEndTime(lb + 1)
      }
      return
    }

    if (endTime <= array[lb].endTime) {
      // No need to add this range, because it's already in the buffer
      return
    }

    array[lb].endTime = Math.max(array[lb].endTime, endTime)
    if (!pending) {
      ;(array as BufferedDataType)[lb].fetchTime += fetchTime
    }
    this.updateEndTime(lb)
  }

  public removeBufferedRange(startTime: number, endTime: number) {
    this.removeRange(startTime, endTime, false)
  }

  public removePendingRange(startTime: number, endTime: number) {
    this.removeRange(startTime, endTime, true)
  }

  private removeRange(startTime: number, endTime: number, pending: boolean) {
    const array = pending ? this.pendingRange : this.bufferedRange
    if (
      array.length === 0 ||
      startTime >= endTime ||
      endTime <= array[0].startTime ||
      startTime >= array[array.length - 1].endTime
    ) {
      return
    }

    startTime = Math.max(startTime, array[0].startTime)

    endTime = Math.min(endTime, array[array.length - 1].endTime)

    let lb = this.lowerBound(array, startTime, 'startTime')
    if (lb === -1) {
      return
    } else if (array[lb].endTime <= startTime) {
      lb++
    }

    let ub = this.upperBound(array, endTime, 'startTime')
    if (ub === -1) {
      ub = array.length - 1
    } else {
      ub--
    }

    if (lb > ub) return

    if (lb < ub) {
      const ubStoredDuration = array[ub].endTime - array[ub].startTime
      const ubFetchTime = pending ? 0 : (array as BufferedDataType)[ub].fetchTime

      if (endTime < array[ub].endTime) {
        array[ub].startTime = endTime
        if (!pending) {
          ;(array as BufferedDataType)[ub].fetchTime =
            (ubFetchTime * (array[ub].endTime - array[ub].startTime)) / ubStoredDuration
        }
      } else {
        array.splice(ub, 1)
      }

      array.splice(lb + 1, ub - lb - 1)

      const lbStoredDuration = array[lb].endTime - array[lb].startTime
      const lbFetchTime = pending ? 0 : (array as BufferedDataType)[lb].fetchTime

      if (array[lb].startTime < startTime) {
        array[lb].endTime = startTime
        if (!pending) {
          ;(array as BufferedDataType)[lb].fetchTime =
            (lbFetchTime * (array[lb].endTime - array[lb].startTime)) / lbStoredDuration
        }
      } else {
        array.splice(lb, 1)
        ub--
      }
    } else {
      let index = lb
      const storedDuration = array[index].endTime - array[index].startTime
      const fetchTime = pending ? 0 : (array as BufferedDataType)[index].fetchTime
      const oldEndTime = array[index].endTime

      if (endTime < oldEndTime) {
        array.splice(index + 1, 0, { startTime: endTime, endTime: oldEndTime })
        if (!pending) {
          ;(array as BufferedDataType)[index + 1].fetchTime =
            (fetchTime * (array[index + 1].endTime - array[index + 1].startTime)) / storedDuration
        }
      }

      if (array[index].startTime < startTime) {
        array[index].endTime = startTime
        if (!pending) {
          ;(array as BufferedDataType)[index].fetchTime =
            (fetchTime * (array[index].endTime - array[index].startTime)) / storedDuration
        }
      } else {
        array.splice(index, 1)
        index--
      }
    }
  }

  private getInterSectionDurationInternal(array: CommonBufferDataType, startTime: number, endTime: number) {
    if (
      array.length === 0 ||
      startTime >= endTime ||
      endTime <= array[0].startTime ||
      startTime >= array[array.length - 1].endTime
    ) {
      return 0
    }

    startTime = Math.max(startTime, array[0].startTime)
    endTime = Math.min(endTime, array[array.length - 1].endTime)

    const lb = this.lowerBound(array, startTime, 'startTime')
    let ub = this.upperBound(array, endTime, 'startTime')
    if (ub === -1) {
      ub = array.length - 1
    } else {
      ub--
    }

    let duration = 0

    for (let i = lb; i <= ub; i++) {
      duration += Math.min(array[i].endTime, endTime) - Math.max(array[i].startTime, startTime)
    }

    return duration
  }

  public getIntersectionDuration(startTime: number, endTime: number) {
    const bufferedDuration = this.getInterSectionDurationInternal(this.bufferedRange, startTime, endTime),
      pendingDuration = this.getInterSectionDurationInternal(this.pendingRange, startTime, endTime),
      missingDuration = endTime - startTime - bufferedDuration - pendingDuration

    return {
      bufferedDuration: bufferedDuration,
      pendingDuration: pendingDuration,
      missingDuration: missingDuration
    }
  }

  public getNextMissing(currentTime: number) {
    let current = currentTime
    if (this.bufferedRange.length === 0 && this.pendingRange.length === 0) {
      return current
    } else if (this.bufferedRange.length === 0) {
      const pendingLb = this.lowerBound(this.pendingRange, current, 'startTime')
      if (pendingLb === -1) {
        return current
      }
      return this.pendingRange[pendingLb].endTime
    } else if (this.pendingRange.length === 0) {
      const bufferedLb = this.lowerBound(this.bufferedRange, current, 'startTime')
      if (bufferedLb === -1) {
        return current
      }
      return this.bufferedRange[bufferedLb].endTime
    }

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const maxOfBoth = Math.max(
        this.bufferedRange.length > 0 ? this.bufferedRange[this.bufferedRange.length - 1].endTime : 0,
        this.pendingRange.length > 0 ? this.pendingRange[this.pendingRange.length - 1].endTime : 0
      )
      if (current >= maxOfBoth) {
        return maxOfBoth
      }

      const bufferedLb = this.lowerBound(this.bufferedRange, current, 'startTime')
      if (bufferedLb === -1) {
        return current
      }

      const pendingLb = this.lowerBound(this.pendingRange, this.bufferedRange[bufferedLb].endTime, 'startTime')
      if (pendingLb === -1) {
        return this.bufferedRange[bufferedLb].endTime
      }
      if (this.pendingRange[pendingLb].endTime <= this.bufferedRange[bufferedLb].endTime) {
        return this.bufferedRange[bufferedLb].endTime
      }
      current = this.pendingRange[pendingLb].endTime
    }
  }

  public getBufferedUntil(currentTime: number) {
    const lb = this.lowerBound(this.bufferedRange, currentTime, 'startTime')
    if (lb === -1) {
      return currentTime
    }
    return this.bufferedRange[lb].endTime
  }

  public getMetrics() {
    return this.metrics
  }

  public resetMetrics() {
    this.metrics.totalFetchTime = 0
    this.metrics.totalPlayTime = 0
  }
}
