import { refreshSceneObjects } from '../../../src/map/functions/refreshSceneObjects'
import { createMapObjects } from '../../../src/map'
import { Object3D } from 'three'
import { addComponent, createEntity, getComponent } from '../../../src/ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../../src/scene/components/Object3DComponent'
import { World } from '../../../src/ecs/classes/World'
import { Entity } from '../../../src/ecs/classes/Entity'
import {MapComponent} from '../../../src/map/MapComponent'

const createMapObjectsMock = createMapObjects as jest.Mock

jest.mock('../../../src/map', () => {
  return {
    createMapObjects: jest.fn(() => {
      return {
        mapMesh: new Object3D()
      }
    })
  }
})

describe('refreshSceneObjects', () => {
  let world: World, mapEntity: Entity

  beforeEach(async () => {
    world = new World()

    mapEntity = createEntity(world.ecsWorld)
  })
  test('when scene objects exist already', async () => {
    addComponent(mapEntity, Object3DComponent, { value: new Object3D() }, world.ecsWorld)
    const oldObject3DComponent = getComponent(mapEntity, Object3DComponent, false, world.ecsWorld)
    const center = [0, 0]
    const args = {}
    addComponent(mapEntity, MapComponent, {
      center,
      viewer: 0,
      triggerRefreshRadius: 20,
      minimumSceneRadius: 80,
      args
    }, world.ecsWorld)
    await refreshSceneObjects(mapEntity, world.ecsWorld)

    const newObject3DComponent = getComponent(mapEntity, Object3DComponent, false, world.ecsWorld)
    expect(createMapObjects).toHaveBeenCalledTimes(1)
    expect(createMapObjects).toHaveBeenCalledWith(center, args)
    // Test it was removed then added to trigger SceneObjectSystem enter/exit queries
    expect(newObject3DComponent).not.toBe(oldObject3DComponent)
    expect(newObject3DComponent.value).toBe(
      createMapObjectsMock.mock.results[0].value.mapMesh
    )
  })
})
