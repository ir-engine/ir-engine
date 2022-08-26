import assert from 'assert'
import { round } from 'lodash'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Object3D, Quaternion, Vector2, Vector3 } from 'three'

import { AvatarControllerComponent } from '../../avatar/components/AvatarControllerComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { NavMesh } from '../../scene/classes/NavMesh'
import { NavMeshComponent } from '../../scene/components/NavMeshComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { AutoPilotComponent } from '../component/AutoPilotComponent'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'

const findClosestProjectedPoint = sinon.spy(
  (_camera: any, _surfaces: any, point: Vector2): [Vector3 | null, number] => {
    return [new Vector3(point.x, point.y, 13), 0]
  }
)
const updatePath = sinon.spy((_path, _1, _2, _3, _4) => {})
const getMovementDirection = sinon.stub()
let _currentPathPoint: Vector3
class Path {
  _current: Vector3
  _finished = false
  advance = sinon.spy()
  current() {
    return _currentPathPoint
  }
  finished() {
    return this._finished
  }
}

const itodo = (s: string, f: any) => {}

/* TODO fix */
describe('AutoPilotSystem', async () => {
  const { default: AutopilotSystem } = proxyquire('./AutopilotSystem', {
    '../functions/findProjectedPoint': { findClosestProjectedPoint },
    '../functions/pathFunctions': { updatePath },
    '../functions/vectorFunctions': { getMovementDirection },
    yuka: { Path }
  })
  let system: () => void
  let avatarEntity: Entity
  let meshEntity: Entity
  let surface: Object3D
  let unprojectedPoint: Vector2
  let navMesh: NavMesh
  let avatarPosition: Vector3

  beforeEach(async () => {
    createEngine()
    system = await AutopilotSystem(Engine.instance.currentWorld)
    const world = Engine.instance.currentWorld
    avatarEntity = createEntity(world)
    meshEntity = createEntity(world)
    unprojectedPoint = new Vector2(23, 42)
    surface = new Object3D()
    navMesh = new NavMesh()
    avatarPosition = new Vector3(42, 13, 23)

    addComponent(avatarEntity, AutoPilotRequestComponent, {
      unprojectedPoint
    })
    addComponent(avatarEntity, TransformComponent, {
      position: avatarPosition,
      rotation: new Quaternion(),
      scale: new Vector3()
    })
    addComponent(avatarEntity, AvatarControllerComponent, {
      localMovementDirection: new Vector3()
    } as any)
    addComponent(meshEntity, NavMeshComponent, {
      value: navMesh
    })
    addComponent(meshEntity, Object3DComponent, {
      value: surface
    })

    _currentPathPoint = new Vector3(0, 0, 0)
    getMovementDirection.reset()
    getMovementDirection.returns(new Vector3())
  })

  itodo('projects requested point onto the nearest nav mesh', () => {
    system()
    assert(
      findClosestProjectedPoint.calledWith(Engine.instance.currentWorld.camera, [surface], unprojectedPoint),
      'calls function with correct args'
    )
    assert.deepStrictEqual(
      getComponent(avatarEntity, AutoPilotComponent).endPoint.toArray(),
      [23, 42, 13],
      'correctly updates the component'
    )
  })

  itodo('removes the request component', () => {
    system()
    assert(!hasComponent(avatarEntity, AutoPilotRequestComponent))
  })

  itodo('generates a path from current avatar location to projected point', () => {
    system()
    assert(
      updatePath.calledWith(
        getComponent(avatarEntity, AutoPilotComponent).path,
        navMesh,
        avatarPosition,
        getComponent(avatarEntity, AutoPilotComponent).endPoint
      )
    )
  })

  itodo('updates the avatar movement to follow generated path', () => {
    const movement = getComponent(avatarEntity, AvatarControllerComponent).localMovementDirection
    getMovementDirection.returns(new Vector3(13, 23, 42))
    system()
    const [x, y, z] = movement.toArray()
    const roundTo3rd = (x: number) => round(x, 3)
    assert.deepStrictEqual(
      [1, roundTo3rd(y / x), roundTo3rd(z / x)],
      [1, roundTo3rd(23 / 13), roundTo3rd(42 / 13)],
      'vector components are proportional'
    )
  })

  itodo('advances the path', () => {
    system()
    const path = getComponent(avatarEntity, AutoPilotComponent).path
    assert((path as unknown as Path).advance.calledOnce)
  })

  itodo('cleans up when the avatar reaches the end of the path', () => {
    system()
    const path = getComponent(avatarEntity, AutoPilotComponent).path as unknown as Path
    path._finished = true
    _currentPathPoint = getComponent(avatarEntity, TransformComponent).position

    system()

    assert(!hasComponent(avatarEntity, AutoPilotComponent), 'removes the autoPilot component')
    // TODO reset movement mode
  })
})
