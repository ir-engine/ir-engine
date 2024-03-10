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

interface BufferMetaData {
  start: number
  end: number
  fetchTime: number
  pending: boolean
}

class BufferData {
  public _data: BufferMetaData[] = []

  constructor(data: any[] = []) {
    this._data = data
  }

  // [1, 2, 3, 3, 3, 4, 5, 6, 7, 8, 9, 10]
  lower_bound(value: number) {
    let start = 0
    let end = this._data.length - 1

    let result = -1

    while (start <= end) {
      const pivot = Math.floor((start + end) / 2)
      if (this._data[pivot].start <= value) {
        result = pivot
        start = pivot + 1
      } else {
        end = pivot - 1
      }
    }
    return result
  }

  updateEnd(insertIndex: number) {
    let index = insertIndex + 1
    while (index < this._data.length && this._data[insertIndex].end >= this._data[index].start) {
      this._data[insertIndex].end = Math.max(this._data[insertIndex].end, this._data[index].end)
      index++
    }
    this._data.splice(insertIndex + 1, index - insertIndex - 1)
  }

  addData(x1: number, y1: number, fetchTime: number, pending: boolean) {
    const position = this.lower_bound(x1)

    if (position === -1) {
      this._data.unshift({ start: x1, end: y1, fetchTime, pending })
      this.updateEnd(0)
    } else {
      if (this._data[position].start === x1) {
        if (this._data[position].end >= y1) {
          // do nothing
        } else {
          this._data[position].end = y1
          this.updateEnd(position)
        }
      } else {
        if (this._data[position].end > x1) {
          // ignore x1, update end
          if (this._data[position].end >= y1) {
            // do nothing
          } else {
            this._data[position].end = y1
            this.updateEnd(position)
          }
        } else if (this._data[position].end === x1) {
          this._data[position].end = y1
          this.updateEnd(position)
        } else {
          this._data.splice(position + 1, 0, { start: x1, end: y1, fetchTime, pending })
          this.updateEnd(position + 1)
        }
      }
    }
  }

  removeData(indices: number[] = []) {
    const newData = this._data.filter((_, index) => !indices.includes(index))
    this._data = newData
  }
}
