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

import { EngineSettingType } from '../schema.type.module'

/**
 * Determines the data type of a given value.
 *
 * @param value - The value to determine the data type of.
 * @returns The data type of the value, which can be 'string', 'boolean', or 'integer'.
 */
export const getDataType = (value: any): EngineSettingType['dataType'] => {
  let dataType = 'string'
  const normalizedValue = value.toLowerCase()
  if (normalizedValue === 'true' || value.toLowerCase() === 'false') {
    dataType = 'boolean'
  } else if (isValidInteger(value)) {
    dataType = 'integer'
  }
  return dataType as EngineSettingType['dataType']
}

/**
 * Parses a string value based on the specified data type.
 *
 * @param value - The string value to be parsed.
 * @param dataType - The data type to which the value should be parsed.
 *                   It can be 'string', 'boolean', or 'integer'.
 * @returns The parsed value in the appropriate data type.
 */
export const parseValue = (value: string, dataType: EngineSettingType['dataType']): any =>
  dataType === 'string'
    ? value
    : dataType === 'boolean'
    ? value === 'true'
    : dataType === 'integer'
    ? Number(value)
    : value

function isValidInteger(value) {
  // Ensure the value is a non-empty string and does not contain non-numeric characters
  if (typeof value !== 'string' || value.trim() === '') return false

  // Convert the string to a number
  const number = Number(value)

  // Check if it's an integer and not NaN
  return Number.isInteger(number)
}
