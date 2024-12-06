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

export type FlattenedEntry = { key: string; value: any }

/**
 * Flattens a nested object into an array of key-value pairs, where each key is a string representing the path to the value in the original object.
 *
 * @param obj - The object to be flattened.
 * @param parentKey - The base path to be prepended to each key in the flattened result. Defaults to an empty string.
 * @returns An array of objects, each containing a `key` and `value` property representing the flattened key-value pairs.
 *
 * @example
 * ```typescript
 * const nestedObject = {
 *   a: {
 *     b: {
 *       c: 1,
 *       d: [2, 3]
 *     },
 *     e: true
 *   }
 * };
 * const result = flattenObjectToArray(nestedObject);
 * // result:
 * // [
 * //   { key: 'a.b.c', value: 1 },
 * //   { key: 'a.b.d.[0]', value: 2 },
 * //   { key: 'a.b.d.[1]', value: 3 },
 * //   { key: 'a.e', value: true }
 * // ]
 * ```
 */
export function flattenObjectToArray(obj: Record<string, any>, parentKey: string = ''): FlattenedEntry[] {
  const result: FlattenedEntry[] = []

  function recurse(currentObj: any, currentPath: string): void {
    for (const key in currentObj) {
      const fullPath = `${currentPath}${key}`
      if (typeof currentObj[key] === 'object' && !Array.isArray(currentObj[key]) && currentObj[key] !== null) {
        recurse(currentObj[key], `${fullPath}.`)
      } else if (Array.isArray(currentObj[key])) {
        currentObj[key].forEach((item, index) => {
          if (typeof item === 'object') {
            recurse(item, `${fullPath}.[${index}].`)
          } else {
            result.push({ key: `${fullPath}.[${index}]`, value: item })
          }
        })
      } else if (typeof currentObj[key] === 'boolean') {
        result.push({ key: fullPath, value: currentObj[key] })
      } else {
        result.push({ key: fullPath, value: currentObj[key] })
      }
    }
  }

  recurse(obj, parentKey)
  return result
}

/**
 * Converts a flattened array of key-value pairs into a nested object.
 *
 * @param {FlattenedEntry[]} flattenedArray - The array of key-value pairs to unflatten.
 * @returns {Record<string, any>} - The resulting nested object.
 *
 * @example
 * ```typescript
 * const flattenedArray = [
 *   { key: 'a.b.c', value: '1' },
 *   { key: 'a.b.d', value: 'true' },
 *   { key: 'e[0]', value: 'false' },
 *   { key: 'e[1]', value: '2' }
 * ];
 * const result = unflattenArrayToObject(flattenedArray);
 * console.log(result);
 * // Output:
 * // {
 * //   a: {
 * //     b: {
 * //       c: '1',
 * //       d: true
 * //     }
 * //   },
 * //   e: [false, '2']
 * // }
 * ```
 */
export function unflattenArrayToObject(flattenedArray: FlattenedEntry[]): Record<string, any> {
  const result: Record<string, any> = {}

  flattenedArray.forEach(({ key, value }) => {
    const keys = key.split(/(?<!\.)\.(?!\.)/).map((k) => k.replace(/\[|\]/g, '')) // Split and clean key
    let current = result

    for (let i = 0; i < keys.length - 1; i++) {
      const part = keys[i]
      const nextPart = keys[i + 1]

      if (!current[part]) {
        current[part] = isNaN(Number(nextPart)) ? {} : [] // Determine if it's an array or object
      }
      current = current[part]
    }

    const lastKey = keys[keys.length - 1]
    current[lastKey] = value === 'true' ? true : value === 'false' ? false : value // Convert boolean strings to boolean values
  })

  return result
}
