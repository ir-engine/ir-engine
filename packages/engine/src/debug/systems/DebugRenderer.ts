import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'

import { createActionQueue } from '@xrengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'

export const DebugRenderer = () => {
  let enabled = false

  const lineMaterial = new LineBasicMaterial({ vertexColors: true })
  const _lineSegments = new LineSegments(new BufferGeometry(), lineMaterial)
  _lineSegments.frustumCulled = false
  setObjectLayers(_lineSegments, ObjectLayers.PhysicsHelper)

  const sceneLoadQueue = createActionQueue(EngineActions.sceneLoaded.matches)

  return (world: World, _enabled: boolean) => {
    for (const action of sceneLoadQueue()) Engine.instance.currentWorld.scene.add(_lineSegments)

    if (enabled !== _enabled) {
      enabled = _enabled
      _lineSegments.visible = enabled
      if (enabled) {
        Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.PhysicsHelper)
      } else {
        Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.PhysicsHelper)
      }
    }

    if (enabled) {
      const debugRenderBuffer = world.physicsWorld.debugRender()
      _lineSegments.geometry.setAttribute('position', new BufferAttribute(debugRenderBuffer.vertices, 3))
      _lineSegments.geometry.setAttribute('color', new BufferAttribute(debugRenderBuffer.colors, 4))
    }
  }
}
