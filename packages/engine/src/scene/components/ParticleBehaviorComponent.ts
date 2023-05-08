import { useEffect } from 'react'
import { Behavior } from 'three.quarks'

import { NO_PROXY } from '@etherealengine/hyperflux'

import { defineComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { BehaviorJSON } from './ParticleSystemComponent'

export type ParticleBehaviorComponentType = {
  behaviorParameters: BehaviorJSON[]
  behaviors: Behavior[]
}

export const ParticleBehaviorComponent = defineComponent({
  name: 'ParticleBehaviorComponent',
  onInit(entity) {
    return {
      behaviorParameters: [],
      behaviors: []
    } as ParticleBehaviorComponentType
  },
  onSet(entity, component, json) {
    json?.behaviorParameters && component.behaviorParameters.set(JSON.parse(JSON.stringify(json.behaviorParameters)))
  },
  reactor: function () {
    const entity = useEntityContext()
    const component = useComponent(entity, ParticleBehaviorComponent)
    useEffect(() => {}, component.behaviorParameters)
    return null
  }
})
