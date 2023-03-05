import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, LineSegments, Vector3 } from 'three'

import { createActionQueue, getState, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { RaycastArgs } from '../../physics/classes/Physics'
import { RaycastHit } from '../../physics/types/PhysicsTypes'
import { RendererState } from '../../renderer/RendererState'
import InfiniteGridHelper from '../../scene/classes/InfiniteGridHelper'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'

type RaycastDebugs = {
  raycastQuery: RaycastArgs
  hits: RaycastHit[]
}

export default async function DebugRendererSystem(world: World) {
  let enabled = false

  InfiniteGridHelper.instance = new InfiniteGridHelper()
  Engine.instance.currentWorld.scene.add(InfiniteGridHelper.instance)

  const debugLines = new Set<Line<BufferGeometry, LineBasicMaterial>>()
  const debugLineLifetime = 1000 // 1 second

  const lineMaterial = new LineBasicMaterial({ vertexColors: true })
  const _lineSegments = new LineSegments(new BufferGeometry(), lineMaterial)
  _lineSegments.frustumCulled = false
  setObjectLayers(_lineSegments, ObjectLayers.PhysicsHelper)
  world.scene.add(_lineSegments)

  const sceneLoadQueue = createActionQueue(EngineActions.sceneLoaded.matches)

  const debugEnable = getState(RendererState).debugEnable

  const execute = () => {
    const _enabled = debugEnable.value

    if (enabled !== _enabled) {
      enabled = _enabled
      _lineSegments.visible = enabled
    }

    if (enabled && world.physicsWorld) {
      const debugRenderBuffer = world.physicsWorld.debugRender()
      _lineSegments.geometry.setAttribute('position', new BufferAttribute(debugRenderBuffer.vertices, 3))
      _lineSegments.geometry.setAttribute('color', new BufferAttribute(debugRenderBuffer.colors, 4))

      for (const { raycastQuery, hits } of (world.physicsWorld as any).raycastDebugs as RaycastDebugs[]) {
        const line = new Line(
          new BufferGeometry().setFromPoints([
            new Vector3(0, 0, 0),
            raycastQuery.direction.clone().multiplyScalar(raycastQuery.maxDistance)
          ]),
          new LineBasicMaterial({ color: 0x0000ff })
        )
        line.position.copy(raycastQuery.origin)
        Engine.instance.currentWorld.scene.add(line)
        debugLines.add(line)
        line.userData.originTime = Date.now()
      }
    } else {
      for (const line of debugLines) {
        Engine.instance.currentWorld.scene.remove(line)
        line.material.dispose()
        line.geometry.dispose()
      }
      debugLines.clear()
    }

    for (const line of debugLines) {
      line.updateMatrixWorld()
      if (Date.now() - line.userData.originTime > debugLineLifetime) {
        Engine.instance.currentWorld.scene.remove(line)
        line.material.dispose()
        line.geometry.dispose()
        debugLines.delete(line)
      }
    }

    if (world.physicsWorld) (world.physicsWorld as any).raycastDebugs = []
  }

  const cleanup = async () => {
    _lineSegments.removeFromParent()
    removeActionQueue(sceneLoadQueue)
    Engine.instance.currentWorld.scene.remove(InfiniteGridHelper.instance)
    InfiniteGridHelper.instance = null!
  }

  return { execute, cleanup }
}
