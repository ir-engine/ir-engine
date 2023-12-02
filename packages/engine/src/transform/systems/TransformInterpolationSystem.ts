import { getState } from '@etherealengine/hyperflux'
import { EngineState } from '../../ecs/classes/EngineState'
import { defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../components/TransformComponent'
import { TransformInterpolationComponent } from '../components/TransformInterpolationComponent'

const interpolationComponents = defineQuery([TransformInterpolationComponent])
export const execute = () => {
  for (const entity of interpolationComponents()) {
    const interpolationComponent = getComponent(entity, TransformInterpolationComponent)
    const transformComponent = getComponent(entity, TransformComponent)
    const time = interpolationComponent.currentTime / interpolationComponent.time
    transformComponent.position.lerpVectors(interpolationComponent.fromPoint, interpolationComponent.toPoint, time)
    interpolationComponent.currentTime += getState(EngineState).deltaSeconds
    if (interpolationComponent.currentTime >= interpolationComponent.time) {
      removeComponent(entity, TransformInterpolationComponent)
    }
  }
}

export const TransformInterpolationSystem = defineSystem({
  uuid: 'ee.engine.TransformInterpolationSystem',
  insert: { after: AnimationSystemGroup },
  execute
})
