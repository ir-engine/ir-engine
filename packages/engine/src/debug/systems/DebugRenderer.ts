import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { World } from '../../ecs/classes/World'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'

export const DebugRenderer = () => {
  let enabled = false

  const lineMaterial = new LineBasicMaterial({ vertexColors: true })
  const _lineSegments = new LineSegments(new BufferGeometry(), lineMaterial)
  _lineSegments.frustumCulled = false

  return (world: World, _enabled: boolean) => {
    if (enabled !== _enabled) {
      enabled = _enabled

      if (enabled) Engine.instance.currentWorld.scene.add(_lineSegments)
      else Engine.instance.currentWorld.scene.remove(_lineSegments)
      _lineSegments.visible = enabled

      const xrCameras = EngineRenderer.instance.xrManager?.getCamera()
      if (enabled) {
        Engine.instance.currentWorld.camera.layers.enable(ObjectLayers.PhysicsHelper)
        if (xrCameras) xrCameras.cameras.forEach((camera) => camera.layers.enable(ObjectLayers.PhysicsHelper))
      } else {
        Engine.instance.currentWorld.camera.layers.disable(ObjectLayers.PhysicsHelper)
        if (xrCameras) xrCameras.cameras.forEach((camera) => camera.layers.disable(ObjectLayers.PhysicsHelper))
      }
    }

    if (enabled) {
      const debugRenderBuffer = world.physicsWorld.debugRender()
      _lineSegments.geometry.setAttribute('position', new BufferAttribute(debugRenderBuffer.vertices, 3))
      _lineSegments.geometry.setAttribute('color', new BufferAttribute(debugRenderBuffer.colors, 4))
    }
  }
}
