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

import { useFind } from '@ir-engine/common'
import { engineSettingPath } from '@ir-engine/common/src/schema.type.module'
import { unflattenArrayToObject } from '@ir-engine/common/src/utils/jsonHelperUtils'
import { useMemo } from 'react'

/**
 * Hook to fetch and parse engine settings for a specific category
 *
 * @param category - The category of engine settings to fetch
 * @param jsonKey - Optional jsonKey to filter settings
 * @returns An object containing the parsed settings and query status
 *
 * @example
 * ```tsx
 * // Get authentication settings
 * const { data: authSettings, status } = useEngineSetting('authentication');
 *
 * // Get client settings
 * const { data: clientSettings, status } = useEngineSetting('client');
 * ```
 */
export function useEngineSetting<T = Record<string, any>>(category: string, key?: string, jsonKey?: string) {
  // Prepare query parameters
  const queryParams: Record<string, any> = {
    category,
    paginate: false
  }

  // Add jsonKey to query if provided
  if (jsonKey) {
    queryParams.jsonKey = jsonKey
  }

  // Fetch engine settings
  const engineSettingQuery = useFind(engineSettingPath, {
    query: queryParams
  })

  // Parse settings using useMemo to avoid unnecessary recalculations
  const parsedSettings = useMemo(() => {
    if (!engineSettingQuery.data || engineSettingQuery.data.length === 0) {
      return null
    }

    return unflattenArrayToObject(
      engineSettingQuery.data.map((setting) => ({
        key: setting.key,
        value: setting.value,
        dataType: setting.dataType
      }))
    ) as T
  }, [engineSettingQuery.data])

  // Return both the parsed settings and the query status
  return {
    data: parsedSettings,
    status: engineSettingQuery.status,
    error: engineSettingQuery.error,
    refetch: engineSettingQuery.refetch
  }
}

export default useEngineSetting
