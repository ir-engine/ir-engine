import { ECSWorld, World } from '@xrengine/engine/src/ecs/classes/World'
import * as mapIndex from '../../src/map/index'
// import * as MapBoxClient from '../../src/map/MapBoxClient'
// import vectors from '../../src/map/vectors'
import { Group, Object3D, Quaternion, Vector3 } from 'three'
import { lat2tile, llToTile, long2tile, tile2lat, tile2long, TILE_ZOOM } from '../../src/map/MapBoxClient'
import { llToScene, llToScene2, sceneToLl } from '../../src/map/MeshBuilder'
import { expect } from '@jest/globals'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { createPipeline, registerSystem } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { MapUpdateSystem } from '../../src/map/MapUpdateSystem'
import { addComponent, createEntity, getComponent } from '../../src/ecs/functions/EntityFunctions'
import { LocalInputReceiverComponent } from '../../src/input/components/LocalInputReceiverComponent'
import { Object3DComponent } from '../../src/scene/components/Object3DComponent'
import { TransformComponent } from '../../src/transform/components/TransformComponent'
import { MapComponent } from '../../src/map/MapComponent'
import * as createMap from '../../src/scene/functions/createMap'
import { MapProps } from '../../src'
import { atlantaGeoCoord, atlantaGeoCoord2, atlantaTileCoord } from './constants'
import { Position } from 'geojson'

let fetchRasterTiles: jest.SpyInstance
let fetchVectorTiles: jest.SpyInstance
let vectorsMock: jest.SpyInstance
let world

// beforeAll(() => {
//     console.log('before everything')
//
//     if (!world) {
//         world = new World()
//     }
//
//     // fetchRasterTiles, fetchVectorTiles, getCenterTile
//     fetchRasterTiles = jest.spyOn(MapBoxClient, 'fetchRasterTiles')
//     fetchVectorTiles = jest.spyOn(MapBoxClient, 'fetchVectorTiles'); //.mockImplementation((args => {
//         // return null
//     // }))
//     // vectorsMock = jest.spyOn(vectors, 'vectors')
//     vectors.vectors = jest.fn(async (blob) => {
//          return {}
//     })
//
//     // @ts-ignore
//     global.fetch = jest.fn(() => {
//         //const res = new Response()
//         return Promise.resolve({
//             blob: () => null
//         })
//     });
//
//     vectorsMock = jest
//         .spyOn(vectors, 'vectors')
//         .mockImplementation((blob, cb) =>
//             cb(null)
//         )
// })

const executePipeline = (world: World, pipeline) => {
  return (delta, elapsedTime) => {
    world.ecsWorld.delta = delta
    world.ecsWorld.time = elapsedTime
    pipeline(world.ecsWorld)
    world.ecsWorld._removedComponents.clear()
  }
}

describe('check MapUpdateSystem', () => {
  const mapCenter = [...atlantaGeoCoord]
  const nearTileGeoCoords = [tile2long(atlantaTileCoord[0] + 2, TILE_ZOOM), tile2lat(atlantaTileCoord[1], TILE_ZOOM)]
  const nearTileSceneCoords = llToScene(nearTileGeoCoords, mapCenter)
  let actor, world: ECSWorld, theWorld: World, freePipeline, execute: (delta, elapsedTime) => void
  let createMapObjectsMock
  beforeAll(async () => {
    theWorld = new World()
    world = theWorld.ecsWorld
    registerSystem(SystemUpdateType.Free, MapUpdateSystem)
    freePipeline = await createPipeline(SystemUpdateType.Free)
    execute = executePipeline(theWorld, freePipeline)

    createMapObjectsMock = jest
      .spyOn(mapIndex, 'createMapObjects')
      .mockImplementation((center: Position, currentCenter: Position, args: MapProps) => {
        console.log('MOCKED createMapObjects', center, currentCenter, args)
        return Promise.resolve({
          mapMesh: new Group(),
          buildingMesh: null,
          groundMesh: null,
          roadsMesh: null,
          navMesh: null,
          labels: null
        })
      })

    actor = createEntity(world)
    addComponent(actor, LocalInputReceiverComponent, {})
    addComponent(actor, Object3DComponent, {
      value: new Object3D()
    })
    addComponent(actor, TransformComponent, {
      position: new Vector3(),
      rotation: new Quaternion(),
      scale: new Vector3().setScalar(1)
    })

    const map = createEntity(world)
    addComponent(map, MapComponent, {
      center: mapCenter,
      currentTile: llToTile(mapCenter),
      loading: false,
      args: {}
    })
    addComponent(map, TransformComponent, {
      position: new Vector3(),
      rotation: new Quaternion(),
      scale: new Vector3().setScalar(1)
    })

    jest.spyOn(mapIndex, 'getTile').mockImplementation(() => {
      console.log('MOCKED getTile', atlantaTileCoord)
      return atlantaTileCoord
    })
    jest.spyOn(mapIndex, 'getCoord').mockImplementation(() => {
      console.log('MOCKED getCoords', atlantaGeoCoord)
      return [...atlantaGeoCoord]
    })
    jest.spyOn(mapIndex, 'getScaleArg').mockImplementation(() => {
      console.log('MOCKED getScaleArg', 1)
      return 1
    })
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('not call update if player moves inside of original tile', async () => {
    // const updateMock = jest.spyOn(mapIndex, "update").mockImplementation(async (args, longtitude, latitude, position) => {
    //     console.log('MAP UPDATE MOCKED')
    //     return { mapMesh: new Group(), buildingMesh: null, groundMesh: null, roadsMesh: null, navMesh: null }
    // })

    //// ---- end or prepare - do test
    const sceneCoordinates = llToScene(atlantaGeoCoord2, mapCenter)
    const actorTransform = getComponent(actor, TransformComponent)
    actorTransform.position.set(sceneCoordinates[0], 0, sceneCoordinates[1])

    execute(1, 1)

    //expect(updateMock.mock.calls.length).toBe(0)
    expect(createMapObjectsMock.mock.calls.length).toBe(0)
  })

  it('calls update if player moves out', async () => {
    const actorTransform = getComponent(actor, TransformComponent)
    // move actor out of center tile
    actorTransform.position.set(nearTileSceneCoords[0], 0, nearTileSceneCoords[1])

    // update should be triggered
    execute(1, 2)
    //expect(updateMock.mock.calls.length).toBe(1)
    expect(createMapObjectsMock.mock.calls.length).toBe(1)
  })

  it('if update is in progress - ignore movement?', async () => {
    const actorTransform = getComponent(actor, TransformComponent)
    // move actor out of center tile
    actorTransform.position.set(nearTileSceneCoords[0], 0, nearTileSceneCoords[1])

    // update should be triggered
    execute(1, 2)

    createMapObjectsMock.mockClear()

    // check that update is not triggered second time
    execute(1, 3)
    expect(createMapObjectsMock.mock.calls.length).toBe(0)
  })
})
