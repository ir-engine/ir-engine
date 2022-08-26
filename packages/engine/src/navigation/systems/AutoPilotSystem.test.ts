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
let _currentPathPoint: Vector3
let path: Vector3[]
const updatePath = sinon.spy((_path: Vector3[], _1, _2, _3, _4) => {
  _path.length = 0
  _path.push(...path)
})
const getMovementDirection = sinon.stub()

describe('AutoPilotSystem', async () => {
  const { default: AutopilotSystem } = proxyquire('./AutopilotSystem', {
    '../functions/findProjectedPoint': { findClosestProjectedPoint },
    '../functions/pathFunctions': { updatePath },
    '../functions/vectorFunctions': { getMovementDirection }
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
      localMovementDirection: new Vector3(),
      velocitySimulator: { init() {} }
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

  it('projects requested point onto the nearest nav mesh', () => {
    path = [new Vector3()]
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

  it('removes the request component', () => {
    system()
    assert(!hasComponent(avatarEntity, AutoPilotRequestComponent))
  })

  it('generates a path from current avatar location to projected point', () => {
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

  it('updates the avatar movement to follow generated path', () => {
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

  it('advances the path as long as the avatar is close to the current point', () => {
    path = [avatarPosition, avatarPosition, avatarPosition]
    system()
    const autoPilot = getComponent(avatarEntity, AutoPilotComponent)
    const prevPathIndex = autoPilot.pathIndex
    system()
    assert.equal(autoPilot.pathIndex, prevPathIndex + 1)
  })

  it('cleans up when the avatar reaches the end of the path', () => {
    system()
    const autoPilot = getComponent(avatarEntity, AutoPilotComponent)
    autoPilot.path = [avatarPosition]
    autoPilot.pathIndex = 0

    system()

    assert(!hasComponent(avatarEntity, AutoPilotComponent), 'removes the autoPilot component')
    // TODO reset movement mode
  })
})
