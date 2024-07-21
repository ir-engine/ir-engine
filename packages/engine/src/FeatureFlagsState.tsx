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

import { featureFlagSettingPath } from '@etherealengine/common/src/schema.type.module'
import { defineState, getMutableState, useHookstate } from '@etherealengine/hyperflux/functions/StateFunctions'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { isUndefined } from 'lodash'
import { useEffect } from 'react'

export const FeatureFlagsState = defineState({
  name: 'ee.engine.FeatureFlagsState',
  initial: {} as Record<string, boolean>,
  enabled(flagName: string) {
    const state = getMutableState(FeatureFlagsState)[flagName].value
    return typeof state === 'boolean' ? state : true
  },
  useEnabled(flagName: string) {
    const state = useHookstate(getMutableState(FeatureFlagsState)[flagName]).value
    if (isUndefined(state)) return false // returns "false" if the get of the FF is in process
    return typeof state === 'boolean' ? state : true
  },
  reactor: () => {
    const featureFlagQuery = useFind(featureFlagSettingPath, { query: { paginate: false } })

    useEffect(() => {
      if (featureFlagQuery.status === 'success') {
        const data = featureFlagQuery.data
        getMutableState(FeatureFlagsState).merge(
          Object.fromEntries(data.map(({ flagName, flagValue }) => [flagName, flagValue]))
        )
      }
    }, [featureFlagQuery.data, featureFlagQuery.status])

    return null
  }
})
