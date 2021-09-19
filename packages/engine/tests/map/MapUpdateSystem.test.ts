import { World } from '@xrengine/engine/src/ecs/classes/World'
import { Object3D, Quaternion, Vector3 } from 'three'
import { createEntity } from '../../src/ecs/functions/EntityFunctions'
import { addComponent, getComponent } from '../../src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../src/transform/components/TransformComponent'
import { MapComponent } from '../../src/map/MapComponent'
import { Entity } from '../../src/ecs/classes/Entity'
import { Object3DComponent } from '../../src/scene/components/Object3DComponent'
import { FollowCameraComponent } from '../../src/camera/components/FollowCameraComponent'
import {createWorld} from '../../src/ecs/functions/EngineFunctions'
import {System} from 'bitecs'
import createSUT from '../../src/map/MapUpdateSystem'
import createStore from '../../src/map/functions/createStore'
import startAvailableTasks from '../../src/map/functions/startAvailableTasks'
import {createProductionPhases} from '../../src/map/functions/createProductionPhases'

jest.mock('../../src/map/functions/startAvailableTasks')
jest.mock('../../src/map/functions/createProductionPhases')

describe('MapUpdateSystem', () => {
  const triggerRefreshRadius = 20 // meters
  const minimumSceneRadius = triggerRefreshRadius * 2
  const mapScale = 0.5
  const mapArgs = {}
  const mapCenter = [0, 0]
  let world: World,
    execute: System,
    viewerEntity: Entity,
    mapEntity: Entity

  beforeEach(async () => {
    world = createWorld()
    viewerEntity = createEntity(world)
    mapEntity = createEntity(world)
    execute = await createSUT(world)

    addComponent(
      viewerEntity,
      TransformComponent,
      {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3().setScalar(1)
      },
      world
    )
    addComponent(viewerEntity, FollowCameraComponent, null, world)

    const store = createStore(mapCenter, mapArgs, triggerRefreshRadius, minimumSceneRadius)
    addComponent(
      mapEntity,
      MapComponent,
      store,
      world
    )
    addComponent(mapEntity, Object3DComponent, { value: new Object3D() }, world)
    addComponent(
      mapEntity,
      TransformComponent,
      {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3().setScalar(mapScale)
      },
      world
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does nothing while player moves within refresh boundary', () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world)

    execute(world)
    viewerTransform.position.set((triggerRefreshRadius / 2) * mapScale, 0, 0)
    execute(world)

    expect(startAvailableTasks).not.toHaveBeenCalled()
  })

  it('start a new production run when player crosses the boundary', async () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world)

    execute(world)
    viewerTransform.position.set(triggerRefreshRadius * mapScale, 0, 0)
    execute(world)

    expect(createProductionPhases).toHaveBeenCalledTimes(1)
    expect(startAvailableTasks).toHaveBeenCalledTimes(1)

    viewerTransform.position.set(triggerRefreshRadius * 1.5 * mapScale, 0, 0)
    execute(world)

    expect(createProductionPhases).toHaveBeenCalledTimes(1)
    expect(startAvailableTasks).toHaveBeenCalledTimes(1)

    viewerTransform.position.set(triggerRefreshRadius * 2 * mapScale, 0, 0)
    execute(world)

    expect(createProductionPhases).toHaveBeenCalledTimes(2)
    expect(startAvailableTasks).toHaveBeenCalledTimes(2)
  })
})
