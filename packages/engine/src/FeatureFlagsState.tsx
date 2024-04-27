import { featureFlagSettingPath } from '@etherealengine/common/src/schema.type.module'
import { PresentationSystemGroup, defineSystem } from '@etherealengine/ecs'
import { defineState, getMutableState, useHookstate } from '@etherealengine/hyperflux/functions/StateFunctions'
import { useFind } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { useEffect } from 'react'

export const FeatureFlagsState = defineState({
  name: 'ee.engine.FeatureFlagsState',
  initial: {} as Record<string, boolean>,
  enabled(flagName: string) {
    const state = getMutableState(FeatureFlagsState)[flagName].value
    return typeof state === 'boolean' ? state : false
  },
  useEnabled(flagName: string) {
    const state = useHookstate(getMutableState(FeatureFlagsState)[flagName]).value
    return typeof state === 'boolean' ? state : false
  }
})

const reactor = () => {
  const featureFlagQuery = useFind(featureFlagSettingPath)

  useEffect(() => {
    if (!featureFlagQuery.data.length) return
    const data = featureFlagQuery.data[0]
    getMutableState(FeatureFlagsState).set(data.flags)
  }, [featureFlagQuery.data])

  return null
}

export const FeatureFlagSystem = defineSystem({
  uuid: 'FeatureFlagSystem',
  insert: { after: PresentationSystemGroup },
  reactor
})
