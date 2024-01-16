import { getMutableState, useState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { getComponent, useQuery } from '../../ecs/functions/ComponentFunctions'
import { PresentationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { configureEffectComposer } from '../../renderer/functions/configureEffectComposer'
import { SDFComponent } from '../components/SDFComponent'

const execute = () => {}

const reactor = () => {
  const sdfQuery = useQuery([SDFComponent])
  const sdfState = useState(getMutableState(SDFComponent.SDFStateSettingsState))

  useEffect(() => {
    if (sdfQuery.length === 0 || !sdfQuery.some((entity) => getComponent(entity, SDFComponent).enable)) {
      getMutableState(SDFComponent.SDFStateSettingsState).enabled.set(false)
    } else {
      getMutableState(SDFComponent.SDFStateSettingsState).enabled.set(true)
    }
  }, [sdfQuery])

  useEffect(() => {
    configureEffectComposer()
  }, [sdfState.enabled])

  return null
}

export const SDFSystem = defineSystem({
  uuid: 'ee.engine.SDFSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
