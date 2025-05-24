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

/**
 * Formats a timestamp for display in the UI
 *
 * For messages from today: displays the time (e.g., "2:30 PM")
 * For messages from yesterday: displays "Yesterday"
 * For messages from this week: displays the day of week (e.g., "Monday")
 * For older messages: displays the date (e.g., "Jan 15")
 *
 * @param timestamp ISO date string
 * @returns Formatted timestamp string
 */
export const formatMessageTimestamp = (timestamp: string): string => {
  if (!timestamp) return ''

  const date = new Date(timestamp)
  const now = new Date()

  // Check if invalid date
  if (isNaN(date.getTime())) return ''

  // Today: show time
  if (isSameDay(date, now)) {
    return formatTime(date)
  }

  // Yesterday: show "Yesterday"
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(date, yesterday)) {
    return 'Yesterday'
  }

  // This week: show day name
  if (isThisWeek(date, now)) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  // This year: show month and day
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Different year: show month, day and year
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * Checks if two dates are the same day
 */
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Checks if a date is within the current week
 */
const isThisWeek = (date: Date, now: Date): boolean => {
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0)

  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // End of week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999)

  return date >= startOfWeek && date <= endOfWeek
}

/**
 * Formats a date to a time string (e.g., "2:30 PM")
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}
