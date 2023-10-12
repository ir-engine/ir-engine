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

export function insertSeparator(children, separatorFn) {
  if (!Array.isArray(children)) {
    return children
  }
  const length = children.length
  if (length === 1) {
    return children[0]
  }
  return children.reduce((acc, item, index) => {
    acc.push(item)
    if (index !== length - 1) {
      acc.push(separatorFn(index))
    }
    return acc
  }, [])
}
export function objectToMap(object: object) {
  return new Map(Object.entries(object))
}

export const unique = <T, S = T>(arr: T[], keyFinder: (item: T) => S): T[] => {
  const set = new Set<S>()
  const newArr = [] as T[]
  if (!keyFinder) keyFinder = (item: T) => item as any as S

  for (const item of arr) {
    const key = keyFinder(item)
    if (set.has(key)) continue

    newArr.push(item)
    set.add(key)
  }

  return newArr
}

export const isApple = () => {
  if ('navigator' in globalThis === false) return false

  const iOS_1to12 = /iPad|iPhone|iPod/.test(navigator.platform)

  const iOS13_iPad = navigator.platform === 'MacIntel'

  const iOS1to12quirk = () => {
    const audio = new Audio() // temporary Audio object
    audio.volume = 0.5 // has no effect on iOS <= 12
    return audio.volume === 1
  }

  return iOS_1to12 || iOS13_iPad || iOS1to12quirk()
}

export const cmdOrCtrlString = isApple() ? 'meta' : 'ctrl'

export function getStepSize(event, smallStep, mediumStep, largeStep) {
  if (event.altKey) {
    return smallStep
  } else if (event.shiftKey) {
    return largeStep
  }
  return mediumStep
}

export function toPrecision(value, precision) {
  const p = 1 / precision
  return Math.round(value * p) / p
}
// https://stackoverflow.com/a/26188910
export function camelPad(str) {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/^./, (str) => {
      return str.toUpperCase()
    })
    .trim()
}
export function bytesToSize(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
