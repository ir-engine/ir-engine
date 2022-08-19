import assert from 'assert'
import proxyquire from 'proxyquire'
import sinon from 'sinon'
import { Object3D, Quaternion, Vector2, Vector3 } from 'three'

import { LifecycleValue } from '../../common/enums/LifecycleValue'
import { NumericalType } from '../../common/types/NumericalTypes'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { createEngine } from '../../initializeEngine'
import { GamepadAxis } from '../../input/enums/InputEnums'
import { InputType } from '../../input/enums/InputType'
import { InputValue } from '../../input/interfaces/InputValue'
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
const getInputX = sinon.spy((_path, _pos) => 13)
const getInputY = sinon.spy((_path, _pos) => 23)
const getInputAngle = sinon.spy((_path, _pos) => 42)
class Path {
  _current: Vector3
  _finished = false
  advance = sinon.spy()
  current() {
    return this._current
  }
  finished() {
    return this._finished
  }
}

describe('AutoPilotSystem', async () => {
  const { default: AutopilotSystem } = proxyquire('./AutopilotSystem', {
    '../functions/findProjectedPoint': { findClosestProjectedPoint },
    '../functions/pathFunctions': { updatePath, getInputX, getInputY, getInputAngle },
    yuka: { Path }
  })
  let system: () => void
  let avatarEntity: Entity
  let meshEntity: Entity
  let surface: Object3D
  let unprojectedPoint: Vector2
  let navMesh: NavMesh
  let avatarPosition: Vector3
  let leftAxis: InputValue

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
    addComponent(meshEntity, NavMeshComponent, {
      value: navMesh,
      debugMode: false
    })
    addComponent(meshEntity, Object3DComponent, {
      value: surface
    })

    system()
    leftAxis = Engine.instance.currentWorld.inputState.get(GamepadAxis.Left)!
  })

  it('projects requested point onto the nearest nav mesh', () => {
    assert(findClosestProjectedPoint.calledWith(Engine.instance.currentWorld.camera, [surface], unprojectedPoint))
    assert.deepStrictEqual(getComponent(avatarEntity, AutoPilotComponent).endPoint.toArray(), [23, 42, 13])
  })

  it('removes the request component', () => {
    assert(!hasComponent(avatarEntity, AutoPilotRequestComponent))
  })

  it('generates a path from current avatar location to projected point', () => {
    assert(
      updatePath.calledWith(
        getComponent(avatarEntity, AutoPilotComponent).path,
        navMesh,
        avatarPosition,
        getComponent(avatarEntity, AutoPilotComponent).endPoint
      )
    )
  })

  it('updates the input state to follow generated path', () => {
    const path = getComponent(avatarEntity, AutoPilotComponent).path
    const position = getComponent(avatarEntity, TransformComponent).position
    assert(getInputX.calledWith(path, position))
    assert(getInputY.calledWith(path, position))
    assert(getInputAngle.calledWith(path, position))
    assert.deepStrictEqual(leftAxis.value, [13, 23, 42])
    assert.strictEqual(leftAxis.lifecycleState, LifecycleValue.Changed)
  })

  it('advances the path', () => {
    const path = getComponent(avatarEntity, AutoPilotComponent).path
    assert((path as unknown as Path).advance.calledOnce)
  })

  it('cleans up when the avatar reaches the end of the path', () => {
    const path = getComponent(avatarEntity, AutoPilotComponent).path as unknown as Path
    path._finished = true

    system()

    assert(!hasComponent(avatarEntity, AutoPilotComponent))
    assert.deepStrictEqual(leftAxis.value, [0, 0])
    assert.strictEqual(leftAxis.lifecycleState, LifecycleValue.Changed)
  })
})
