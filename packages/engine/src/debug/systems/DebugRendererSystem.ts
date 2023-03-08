import { useEffect } from 'react'
import { BufferAttribute, BufferGeometry, Line, LineBasicMaterial, LineSegments, Mesh, Vector3 } from 'three'
import { MeshBVHVisualizer } from 'three-mesh-bvh'

import {
  createActionQueue,
  getMutableState,
  removeActionQueue,
  startReactor,
  useHookstate
} from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { useOptionalComponent } from '../../ecs/functions/ComponentFunctions'
import { RaycastArgs } from '../../physics/classes/Physics'
import { RaycastHit } from '../../physics/types/PhysicsTypes'
import { RendererState } from '../../renderer/RendererState'
import InfiniteGridHelper from '../../scene/classes/InfiniteGridHelper'
import { GroupComponent, startGroupQueryReactor } from '../../scene/components/GroupComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'

type RaycastDebugs = {
  raycastQuery: RaycastArgs
  hits: RaycastHit[]
}

export default async function DebugRendererSystem() {
  let enabled = false

  InfiniteGridHelper.instance = new InfiniteGridHelper()
  Engine.instance.scene.add(InfiniteGridHelper.instance)

  const debugLines = new Set<Line<BufferGeometry, LineBasicMaterial>>()
  const debugLineLifetime = 1000 // 1 second

  const lineMaterial = new LineBasicMaterial({ vertexColors: true })
  const _lineSegments = new LineSegments(new BufferGeometry(), lineMaterial)
  _lineSegments.frustumCulled = false
  setObjectLayers(_lineSegments, ObjectLayers.PhysicsHelper)
  Engine.instance.scene.add(_lineSegments)

  const sceneLoadQueue = createActionQueue(EngineActions.sceneLoaded.matches)

  const debugEnable = getMutableState(RendererState).debugEnable
  const visualizers = [] as MeshBVHVisualizer[]

  startGroupQueryReactor(function DebugReactor(props) {
    const entity = props.entity
    const group = useOptionalComponent(entity, GroupComponent)
    const debug = useHookstate(debugEnable)

    // add MeshBVHVisualizer to meshes when debugEnable is true
    useEffect(() => {
      const groupVisualizers = [] as MeshBVHVisualizer[]

      function addMeshVVHVisualizer(obj: Mesh) {
        const mesh = obj as any as Mesh
        if (mesh.isMesh && mesh.geometry?.boundsTree) {
          const meshBVHVisualizer = new MeshBVHVisualizer(mesh)
          mesh.parent!.add(meshBVHVisualizer)
          visualizers.push(meshBVHVisualizer)
          groupVisualizers.push(meshBVHVisualizer)
          meshBVHVisualizer.depth = 20
          meshBVHVisualizer.displayParents = false
          meshBVHVisualizer.update()
          return meshBVHVisualizer
        }
      }

      if (debug.value && group) {
        for (const obj of group.value) obj.traverse(addMeshVVHVisualizer)
        return () => {
          for (const visualizer of groupVisualizers) {
            visualizer.removeFromParent()
            visualizers.splice(visualizers.indexOf(visualizer), 1)
          }
        }
      }
    }, [group, debug])

    return null
  })

  const execute = () => {
    const _enabled = debugEnable.value

    if (enabled !== _enabled) {
      enabled = _enabled
      _lineSegments.visible = enabled
    }

    if (enabled && Engine.instance.physicsWorld) {
      const debugRenderBuffer = Engine.instance.physicsWorld.debugRender()
      _lineSegments.geometry.setAttribute('position', new BufferAttribute(debugRenderBuffer.vertices, 3))
      _lineSegments.geometry.setAttribute('color', new BufferAttribute(debugRenderBuffer.colors, 4))

      for (const { raycastQuery, hits } of (Engine.instance.physicsWorld as any).raycastDebugs as RaycastDebugs[]) {
        const line = new Line(
          new BufferGeometry().setFromPoints([
            new Vector3(0, 0, 0),
            raycastQuery.direction.clone().multiplyScalar(raycastQuery.maxDistance)
          ]),
          new LineBasicMaterial({ color: 0x0000ff })
        )
        line.position.copy(raycastQuery.origin)
        Engine.instance.scene.add(line)
        debugLines.add(line)
        line.userData.originTime = Date.now()
      }
    } else {
      for (const line of debugLines) {
        Engine.instance.scene.remove(line)
        line.material.dispose()
        line.geometry.dispose()
      }
      debugLines.clear()
    }

    for (const visualizer of visualizers) {
      visualizer.updateMatrixWorld(true)
    }

    for (const line of debugLines) {
      line.updateMatrixWorld()
      if (Date.now() - line.userData.originTime > debugLineLifetime) {
        Engine.instance.scene.remove(line)
        line.material.dispose()
        line.geometry.dispose()
        debugLines.delete(line)
      }
    }

    if (Engine.instance.physicsWorld) (Engine.instance.physicsWorld as any).raycastDebugs = []
  }

  const cleanup = async () => {
    _lineSegments.removeFromParent()
    removeActionQueue(sceneLoadQueue)
    Engine.instance.scene.remove(InfiniteGridHelper.instance)
    InfiniteGridHelper.instance = null!
  }

  return { execute, cleanup }
}
