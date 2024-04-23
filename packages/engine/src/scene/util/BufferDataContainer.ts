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

type BufferedDataType = {
  startTime: number // in custom timeUnits
  endTime: number // in custom timeUnits
  fetchTime: number // in seconds
}[]

type PendingBufferDataType = {
  startTime: number
  endTime: number
}[]

type CommonBufferDataType = {
  startTime: number
  endTime: number
}[]

class BufferData {
  public bufferedRange: BufferedDataType
  public pendingRange: PendingBufferDataType

  constructor() {
    this.bufferedRange = []
    this.pendingRange = []
  }

  private lowerBound(array: CommonBufferDataType, value: number, property: 'startTime' | 'endTime' = 'startTime') {
    const length = array.length
    let low = 0,
      high = length - 1,
      index = -1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (array[mid].startTime <= value) {
        index = mid
        low = mid + 1
      } else {
        high = mid - 1
      }
    }

    return index
  }

  private upperBound(array: CommonBufferDataType, value: number, property: 'startTime' | 'endTime' = 'endTime') {
    const length = array.length
    let low = 0,
      high = length - 1,
      index = -1
    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      if (array[mid].endTime > value) {
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
    while (i < length && array[index].startTime >= array[i].startTime) {
      array[i].endTime = Math.max(array[index].startTime, array[i].endTime)

      if (!pending) {
        this.bufferedRange[i].fetchTime = this.bufferedRange[index].fetchTime + this.bufferedRange[i].fetchTime
      }

      i++
    }
  }

  public addRange(startTime: number, endTime: number, fetchTime: number, pending: boolean) {
    const array = pending ? this.pendingRange : this.bufferedRange
    if (startTime >= endTime) {
      return
    }

    if (!pending) {
      this.removeRange(startTime, endTime, true)
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

  public removeRange(startTime: number, endTime: number, pending: boolean) {
    const array = pending ? this.pendingRange : this.bufferedRange
    if (startTime >= endTime) {
      return
    }

    const length = array.length

    if (length === 0 || endTime <= array[0].startTime || startTime >= array[length - 1].endTime) {
      return
    }

    startTime = Math.max(startTime, array[0].startTime)

    endTime = Math.min(endTime, array[length - 1].endTime)

    const lb = this.lowerBound(array, startTime, 'startTime')
    let ub = this.upperBound(array, endTime, 'startTime')
    if (ub === -1) {
      ub = length - 1
    } else {
      ub--
    }

    if (lb < ub) {
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
    } else {
      let index = lb
      const storedDuration = array[index].endTime - array[index].startTime
      const fetchTime = pending ? 0 : (array as BufferedDataType)[index].fetchTime
      const oldEndTime = array[index].endTime

      // new intervals: [array[index].startTime, startTime] and [endTime, array[index].endTime]

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

      if (endTime < oldEndTime) {
        array.splice(index + 1, 0, { startTime: endTime, endTime: oldEndTime })
        if (!pending) {
          ;(array as BufferedDataType)[index + 1].fetchTime =
            (fetchTime * (array[index + 1].endTime - array[index + 1].startTime)) / storedDuration
        }
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
}
