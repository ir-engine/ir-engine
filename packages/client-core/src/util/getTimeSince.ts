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

const SECOND = 1
const MINUTE = SECOND * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const WEEK = DAY * 7
const MONTH = DAY * 30
const YEAR = DAY * 365

const intervals = [
  {
    label: 'year',
    interval: YEAR,
    roundUp: true,
    firstRoundUp: true
  },
  {
    label: 'month',
    interval: MONTH,
    roundUp: true,
    firstRoundUp: false
  },
  {
    label: 'week',
    interval: WEEK,
    roundUp: true,
    firstRoundUp: false
  },
  {
    label: 'day',
    interval: DAY,
    roundUp: true,
    firstRoundUp: false
  },
  {
    label: 'hour',
    interval: HOUR,
    roundUp: true,
    firstRoundUp: false
  },
  {
    label: 'minute',
    interval: MINUTE,
    roundUp: true,
    firstRoundUp: false
  },
  {
    label: 'second',
    interval: SECOND,
    roundUp: true,
    firstRoundUp: true
  }
]

export function getTimeSince(dateStr: string | Date | number) {
  const date = new Date(dateStr)
  const now = new Date()
  const timeDifference = Math.floor((now.getTime() - date.getTime()) / 1000) // in seconds

  for (let i = 0; i < intervals.length; i++) {
    const { label, interval } = intervals[i]
    let count = Math.floor(timeDifference / interval)

    if (label === 'second' && count < 30) {
      return 'just now'
    }

    const remainder = timeDifference % interval

    if (count >= 1 && i < intervals.length - 1 && intervals[i + 1].roundUp && remainder >= interval / 2) {
      count++
    } else if (count < 1 && i < intervals.length - 1 && intervals[i + 1].firstRoundUp && remainder >= interval / 2) {
      count++
    }

    if (i > 0 && count * interval === intervals[i - 1].interval) {
      return `1 ${intervals[i - 1].label} ${intervals[i - 1].interval > 1 ? 's' : ''} ago`
    }

    if (count >= 1) {
      return `${count.toLocaleString()} ${label}${count > 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}
