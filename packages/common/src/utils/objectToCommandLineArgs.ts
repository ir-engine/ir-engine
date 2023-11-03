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

function castValue(value, type) {
  switch (type.toLowerCase()) {
    case 'number':
      return parseFloat(value)
    case 'boolean':
      return value === 'true'
    case 'string':
      return value
    default:
      return value
  }
}

export function objectToArgs(obj: any, prefix = '') {
  const args: string[] = []

  for (const [key, value] of Object.entries(obj)) {
    let newPrefix = prefix ? `${prefix}_${key}` : `${key}`

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        args.push(...objectToArgs(item, `${newPrefix}_${index}`))
      })
    } else if (value !== null && typeof value === 'object') {
      args.push(...objectToArgs(value, newPrefix))
    } else {
      const type = typeof value
      args.push(`--${newPrefix}_${type}`, String(value))
    }
  }

  return args
}

export function argsToObject(args: string[]): any {
  const obj: Record<string, any> = {}
  for (let i = 0; i < args.length; i += 2) {
    const arg = args[i]
    const value = args[i + 1]

    const keys: string[] = arg.slice(2).split('_')
    const type = keys.pop()
    const parsedKeys = keys.map((key, i) => (isNaN(Number.parseFloat(keys[i])) ? key.toLowerCase() : Number(key)))

    let current = obj

    parsedKeys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = castValue(value, type)
      } else {
        if (current[key] === undefined) {
          current[key] = typeof keys[index + 1] === 'number' ? [] : {}
        }
        current = current[key]
      }
    })
  }
  return obj
}
