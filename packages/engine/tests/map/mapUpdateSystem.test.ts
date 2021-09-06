import { PipelineType, World } from '@xrengine/engine/src/ecs/classes/World'
import { Object3D, Quaternion, Vector3 } from 'three'
import { sceneToLl } from '../../src/map/MeshBuilder'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { createPipeline, registerSystem, unregisterSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { MapUpdateSystem } from '../../src/map/MapUpdateSystem'
import { addComponent, createEntity, getComponent } from '../../src/ecs/functions/EntityFunctions'
import { TransformComponent } from '../../src/transform/components/TransformComponent'
import { MapComponent } from '../../src/map/MapComponent'
import { Entity } from '../../src/ecs/classes/Entity'
import { Object3DComponent } from '../../src/scene/components/Object3DComponent'
import refreshSceneObjects from '../../src/map/functions/refreshSceneObjects'
// import { cloneDeep } from 'lodash'
import { enqueueTasks } from '../../src/map'
import { FollowCameraComponent } from '../../src/camera/components/FollowCameraComponent'

jest.mock('../../src/map')

const executePipeline = (world: World, pipeline: PipelineType) => {
  return (delta: number, elapsedTime: number) => {
    world.ecsWorld.delta = delta
    world.ecsWorld.time = elapsedTime
    pipeline(world.ecsWorld)
    world.ecsWorld._removedComponents.clear()
  }
}

describe('MapUpdateSystem', () => {
  const triggerRefreshRadius = 20 // meters
  const minimumSceneRadius = triggerRefreshRadius * 2
  const mapScale = 0.5
  const mapArgs = {}
  let world: World,
    execute: (delta: number, elapsedTime: number) => void,
    freePipeline: PipelineType,
    viewerEntity: Entity,
    mapEntity: Entity

  beforeEach(async () => {
    world = new World()
    viewerEntity = createEntity(world.ecsWorld)
    mapEntity = createEntity(world.ecsWorld)
    registerSystem(SystemUpdateType.Free, MapUpdateSystem)
    freePipeline = await createPipeline(SystemUpdateType.Free)
    execute = executePipeline(world, freePipeline)

    addComponent(
      viewerEntity,
      TransformComponent,
      {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3().setScalar(1)
      },
      world.ecsWorld
    )
    addComponent(viewerEntity, FollowCameraComponent, null, world.ecsWorld)

    addComponent(
      mapEntity,
      MapComponent,
      {
        center: [0, 0],
        originalCenter: [0, 0],
        triggerRefreshRadius,
        minimumSceneRadius,
        args: mapArgs
      },
      world.ecsWorld
    )
    addComponent(mapEntity, Object3DComponent, { value: new Object3D() }, world.ecsWorld)
    addComponent(
      mapEntity,
      TransformComponent,
      {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3().setScalar(mapScale)
      },
      world.ecsWorld
    )
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    unregisterSystem(SystemUpdateType.Free, MapUpdateSystem)
  })

  it('enqueues map construction tasks on the first frame', () => {
    execute(0, 0)

    expect(enqueueTasks).toHaveBeenCalledTimes(1)
    expect(enqueueTasks).toHaveBeenCalledWith(sceneToLl([0, 0, 0]), minimumSceneRadius, mapArgs)
  })

  it('does not refresh when player moves within refresh boundary', async () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world.ecsWorld)

    execute(0, 0)
    viewerTransform.position.set((triggerRefreshRadius / 2) * mapScale, 0, 0)
    execute(1, 1)

    expect(enqueueTasks).toHaveBeenCalledTimes(1)
  })

  it.todo('does not directly modify any components')
  // it('only modifies MapComponent#center, MapComponent#refreshInProgress', async () => {
  //   const map = getComponent(mapEntity, MapComponent, false, world.ecsWorld)
  //   const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world.ecsWorld)
  //   const mapTransform = getComponent(mapEntity, TransformComponent, false, world.ecsWorld)

  //   viewerTransform.position.set(triggerRefreshRadius / 2, 0, 0)

  //   const mapClone = cloneDeep(map)
  //   const viewerTransformClone = cloneDeep(viewerTransform)
  //   const mapTransformClone = cloneDeep(mapTransform)

  //   execute(1, 1)

  //   map.center = mapClone.center
  //   map.refreshInProgress = mapClone.refreshInProgress

  //   expect(map).toEqual(mapClone)
  //   expect(viewerTransform).toEqual(viewerTransformClone)
  //   expect(mapTransform).toEqual(mapTransformClone)
  // })

  it('enqueues new tasks when player crosses refresh trigger', async () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world.ecsWorld)

    execute(0, 0)
    viewerTransform.position.set(triggerRefreshRadius * mapScale, 0, 0)
    execute(1, 1)

    const viewerPositionDeltaScaled = [triggerRefreshRadius, 0]
    expect(enqueueTasks).toHaveBeenCalledTimes(2)
    expect(enqueueTasks).toHaveBeenCalledWith(sceneToLl(viewerPositionDeltaScaled), minimumSceneRadius, mapArgs)

    viewerTransform.position.set(triggerRefreshRadius * 1.5 * mapScale, 0, 0)
    execute(1, 2)

    expect(enqueueTasks).toHaveBeenCalledTimes(2)

    viewerTransform.position.set(triggerRefreshRadius * 2 * mapScale, 0, 0)
    execute(1, 3)

    expect(enqueueTasks).toHaveBeenCalledTimes(3)
    expect(enqueueTasks).toHaveBeenCalledWith(sceneToLl([triggerRefreshRadius * 2, 0, 0]), minimumSceneRadius, mapArgs)
  })
})
