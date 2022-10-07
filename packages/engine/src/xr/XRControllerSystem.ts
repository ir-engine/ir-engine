import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { World } from '../ecs/classes/World'
import { defineQuery, setComponent } from '../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity } from '../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../renderer/WebGLRendererSystem'
import { NameComponent } from '../scene/components/NameComponent'
import {
  LocalTransformComponent,
  setLocalTransformComponent,
  setTransformComponent,
  TransformComponent
} from '../transform/components/TransformComponent'
import { XRControllerComponent, XRHandComponent, XRInputSourceComponent } from './XRComponents'

export const xrInputSourcesMap = new Map<XRInputSource, Entity>()

export default async function XRCameraSystem(world: World) {
  const controllerQuery = defineQuery([XRControllerComponent])

  const onInputSourcesChange = ({ removed, added }: XRInputSourceChangeEvent) => {
    for (const inputSource of removed) {
      removeEntity(xrInputSourcesMap.get(inputSource)!)
      xrInputSourcesMap.delete(inputSource)
    }

    for (const inputSource of added) {
      const entity = createEntity()
      const handedness = inputSource.handedness === 'none' ? '' : inputSource.handedness === 'left' ? ' Left' : ' Right'
      setComponent(entity, NameComponent, { name: `XR Controller${handedness}` })
      setTransformComponent(entity)
      setLocalTransformComponent(entity, world.localClientEntity)
      setComponent(entity, XRControllerComponent, { handedness: inputSource.handedness })
      xrInputSourcesMap.set(inputSource, entity)!
    }
  }

  const addEventListners = () => {
    EngineRenderer.instance.xrSession.addEventListener('inputsourceschange', onInputSourcesChange)
  }

  const execute = () => {
    if (Engine.instance.xrFrame) {
      for (const [inputSource, entity] of Array.from(xrInputSourcesMap)) {
      }
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
