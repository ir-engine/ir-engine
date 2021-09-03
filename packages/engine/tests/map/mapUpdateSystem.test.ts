import { PipelineType, World } from '@xrengine/engine/src/ecs/classes/World'
import { Object3D, Quaternion, Vector3 } from 'three'
import { llToTile, tile2lat, tile2long, TILE_ZOOM } from '../../src/map/MapBoxClient'
import { llToScene, sceneToLl } from '../../src/map/MeshBuilder'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { createPipeline, registerSystem, unregisterSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { MapUpdateSystem } from '../../src/map/MapUpdateSystem'
import { addComponent, createEntity, getComponent } from '../../src/ecs/functions/EntityFunctions'
import { TransformComponent } from '../../src/transform/components/TransformComponent'
import { MapComponent } from '../../src/map/MapComponent'
import { atlantaGeoCoord, atlantaGeoCoord2, atlantaTileCoord } from './constants'
import { Entity } from '../../src/ecs/classes/Entity'
import { Object3DComponent } from '../../src/scene/components/Object3DComponent'
import refreshSceneObjects from '../../src/map/functions/refreshSceneObjects'
import {cloneDeep} from 'lodash'

// decouple this "loader" from the concept of tiles...
// Let there be a service (worker/backend) that fetches tiles and bakes the Object3Ds (neglecting navigation stuff for now.) Then a GeographicObjectSystem (formerly MapUpdateSystem) uses the value of the player entity's TransformComponent to request an Object3D created by the service. The system then updates Object3DComponent of the map entity. When the player moves a certain amount, the system makes a new request to the service, receives a new Object3D and updates the Object3DComponent of the map entity.
//
jest.mock('../../src/map/functions/refreshSceneObjects', () => jest.fn(() => Promise.resolve()))

const executePipeline = (world: World, pipeline: PipelineType) => {
  return (delta: number, elapsedTime: number) => {
    world.ecsWorld.delta = delta
    world.ecsWorld.time = elapsedTime
    pipeline(world.ecsWorld)
    world.ecsWorld._removedComponents.clear()
  }
}

const triggerRefreshRadius = 20 // meters

describe('MapUpdateSystem', () => {
  let world: World,
    execute: (delta: number, elapsedTime: number) => void,
    freePipeline: PipelineType,
    viewerEntity: Entity,
    mapEntity: Entity

  beforeEach(async () => {
    world = new World()
    registerSystem(SystemUpdateType.Free, MapUpdateSystem)
    freePipeline = await createPipeline(SystemUpdateType.Free)
    execute = executePipeline(world, freePipeline)

    viewerEntity = createEntity(world.ecsWorld)
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

    mapEntity = createEntity(world.ecsWorld)
    addComponent(
      mapEntity,
      MapComponent,
      {
        center: [0, 0],
        triggerRefreshRadius,
        refreshInProgress: false,
        minimumSceneRadius: triggerRefreshRadius * 2,
        viewer: viewerEntity,
        args: {}
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
        scale: new Vector3().setScalar(1)
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

  it('does not refresh when player moves within refresh boundary', async () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world.ecsWorld)

    viewerTransform.position.set(triggerRefreshRadius / 2, 0, 0)
    execute(1, 1)

    expect(refreshSceneObjects).toHaveBeenCalledTimes(0)
  })

  it('only modifies MapComponent#center, MapComponent#refreshInProgress', async () => {
    const map = getComponent(mapEntity, MapComponent, false, world.ecsWorld)
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world.ecsWorld)
    const mapTransform = getComponent(mapEntity, TransformComponent, false, world.ecsWorld)

    viewerTransform.position.set(triggerRefreshRadius / 2, 0, 0)

    const mapClone = cloneDeep(map)
    const viewerTransformClone = cloneDeep(viewerTransform)
    const mapTransformClone = cloneDeep(mapTransform)

    execute(1, 1)

    map.center = mapClone.center
    map.refreshInProgress = mapClone.refreshInProgress

    expect(map).toEqual(mapClone)
    expect(viewerTransform).toEqual(viewerTransformClone)
    expect(mapTransform).toEqual(mapTransformClone)
  })

  it('refreshes when player crosses refresh trigger', async () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world.ecsWorld)
    let previousCenter = getComponent(mapEntity, MapComponent, false, world.ecsWorld).center.slice()

    viewerTransform.position.set(triggerRefreshRadius, 0, 0)
    execute(1, 1)

    let newCenter = getComponent(mapEntity, MapComponent, false, world.ecsWorld).center

    expect(refreshSceneObjects).toHaveBeenCalledTimes(1)
    expect(refreshSceneObjects).toHaveBeenCalledWith(mapEntity, world.ecsWorld)
    expect(newCenter).toEqual(sceneToLl([triggerRefreshRadius, 0], previousCenter))
  })

  it('does not refresh when a refresh is in progress', () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world.ecsWorld)

    // player moves
    viewerTransform.position.set(triggerRefreshRadius, 0, 0)
    execute(1, 1)

    execute(1, 1)

    let resolvePromise: any
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    ;(refreshSceneObjects as jest.Mock).mockImplementation(() => promise)

    resolvePromise()
    execute(1, 1)
    expect(refreshSceneObjects).toHaveBeenCalledTimes(1)
  })

  it('does not refresh again if player does not cross boundary again', () => {
    const viewerTransform = getComponent(viewerEntity, TransformComponent, false, world.ecsWorld)
    const mapTransform = getComponent(mapEntity, TransformComponent, false, world.ecsWorld)

    // player moves
    viewerTransform.position.set(triggerRefreshRadius, 0, 0)
    // Simulate a refresh, movement has already been handled
    mapTransform.position.copy(viewerTransform.position)

    execute(1, 1)

    expect(refreshSceneObjects).toHaveBeenCalledTimes(0)
  })
})
