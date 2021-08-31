import { PipelineType, World } from '@xrengine/engine/src/ecs/classes/World'
import { Object3D, Quaternion, Vector3 } from 'three'
import { llToTile, tile2lat, tile2long, TILE_ZOOM } from '../../src/map/MapBoxClient'
import { llToScene } from '../../src/map/MeshBuilder'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { createPipeline, registerSystem, unregisterSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { MapUpdateSystem } from '../../src/map/MapUpdateSystem'
import { addComponent, createEntity, getComponent } from '../../src/ecs/functions/EntityFunctions'
import { TransformComponent } from '../../src/transform/components/TransformComponent'
import { MapComponent } from '../../src/map/MapComponent'
import { atlantaGeoCoord, atlantaGeoCoord2, atlantaTileCoord } from './constants'
import { createMapObjects as createMapObjectsMock } from '../../src/map'
import { Entity } from '../../src/ecs/classes/Entity'
import {Object3DComponent} from '../../src/scene/components/Object3DComponent'

// decouple this "loader" from the concept of tiles. Tiles are a Web map storage convention, no reason other than expedience that we have to jam into the scene entire, fairly large, tiles all at once. Instead, drawing on the work of @xiani_zp and @alexmz, there can be a service (worker/backend) that fetches tiles and bakes the Object3Ds (neglecting navigation stuff for now.) Then a GeographicObjectSystem (formerly MapUpdateSystem) uses the value of the player entity's TransformComponent to request "geographic objects" within a certain radius of the player. These would contain an Object3D created by the service. The system then creates one entity for each object, assigning an Object3DComponent, handled by the SceneObjectSystem. When the player moves a certain amount, the system makes a new request to the service. The GeographicObjectSystem also maintains an associative array of these geographic objects so that it knows not to create redundant entities. The system also regularly checks if any of these geographic objects are outside of a certain radius of the player, in which case the geographic object's resources are freed and removed from the associative array (automatically if implemented with a WeakMap). Besides an Object3D, geographic objects would also contain the data for a TransformComponent so the Object3Ds are correctly positioned, rotated etc the scene. The service would be responsible for deriving a latlong given the scene coords, making a request to Mapbox's API, caching, baking Object3Ds etc. Humbly awaiting your comments. This is very off the cuff, just wanted to start the conversation.


jest.mock('../../src/map', () => {
  return {
    createMapObjects: jest.fn(() => {
      return {
        mapMesh: new Object3D(),
        navMesh: new Object3D(),
        groundMesh: new Object3D()
      }
    })
  }
})

const executePipeline = (world: World, pipeline: PipelineType) => {
  return (delta: number, elapsedTime: number) => {
    world.ecsWorld.delta = delta
    world.ecsWorld.time = elapsedTime
    pipeline(world.ecsWorld)
    world.ecsWorld._removedComponents.clear()
  }
}

const triggerRefreshRadius = 20 // meters

describe('check MapUpdateSystem', () => {
  const mapCenter = [...atlantaGeoCoord]
  const nearTileGeoCoords = [tile2long(atlantaTileCoord[0] + 2, TILE_ZOOM), tile2lat(atlantaTileCoord[1], TILE_ZOOM)]
  const nearTileSceneCoords = llToScene(nearTileGeoCoords, mapCenter)
  let world: World,
    execute: (delta: number, elapsedTime: number) => void,
    freePipeline: PipelineType,
    viewer: Entity,
    map: Entity

  beforeEach(async () => {
    world = new World()
    registerSystem(SystemUpdateType.Free, MapUpdateSystem)
    freePipeline = await createPipeline(SystemUpdateType.Free)
    execute = executePipeline(world, freePipeline)

    viewer = createEntity(world.ecsWorld)
    addComponent(
      viewer,
      TransformComponent,
      {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3().setScalar(1)
      },
      world.ecsWorld
    )

    map = createEntity(world.ecsWorld)
    addComponent(
      map,
      MapComponent,
      {
        center: [0, 0],
        triggerRefreshRadius,
        viewer,
        args: {}
      },
      world.ecsWorld
    )
    addComponent(
      map,
      Object3DComponent,
      { value: new Object3D()},
      world.ecsWorld
    )
    addComponent(
      map,
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

  it('does not update when player moves within update boundary', async () => {
    const actorTransform = getComponent(viewer, TransformComponent, false, world.ecsWorld)

    actorTransform.position.set(triggerRefreshRadius / 2, 0, 0)
    execute(1, 1)

    expect(createMapObjectsMock).toHaveBeenCalledTimes(0)
  })

  it('updates when player crosses update boundary', async () => {
    const actorTransform = getComponent(viewer, TransformComponent, false, world.ecsWorld)

    actorTransform.position.set(triggerRefreshRadius, 0, 0)
    execute(1, 1)

    expect(createMapObjectsMock).toHaveBeenCalledTimes(1)
  })

  // it('if update is in progress - ignore movement?', async () => {
  //   const actorTransform = getComponent(actor, TransformComponent)
  //   // move actor out of center tile
  //   actorTransform.position.set(nearTileSceneCoords[0], 0, nearTileSceneCoords[1])

  //   // update should be triggered
  //   execute(1, 2)

  //   createMapObjectsMock.mockClear()

  //   // check that update is not triggered second time
  //   execute(1, 3)
  //   expect(createMapObjectsMock.mock.calls.length).toBe(0)
  // })
})
