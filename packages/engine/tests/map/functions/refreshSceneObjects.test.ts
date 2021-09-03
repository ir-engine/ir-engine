import refreshSceneObjects from '../../../src/map/functions/refreshSceneObjects'
import { createMapObjects } from '../../../src/map'
import { Object3D, Quaternion, Vector3 } from 'three'
import { addComponent, createEntity, getComponent } from '../../../src/ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../../src/scene/components/Object3DComponent'
import { World } from '../../../src/ecs/classes/World'
import { Entity } from '../../../src/ecs/classes/Entity'
import { MapComponent } from '../../../src/map/MapComponent'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'

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

function addTransformComponentWithPosition(entity: Entity, world: World, x: number, y: number, z: number) {
  addComponent(
    entity,
    TransformComponent,
    { position: new Vector3(x, y, z), rotation: new Quaternion(), scale: new Vector3() },
    world.ecsWorld
  )
}

describe('refreshSceneObjects', () => {
  let world: World, mapEntity: Entity, viewerEntity: Entity

  beforeEach(async () => {
    world = new World()

    mapEntity = createEntity(world.ecsWorld)
    viewerEntity = createEntity(world.ecsWorld)
  })
  test('when scene objects exist already', async () => {
    addComponent(mapEntity, Object3DComponent, { value: new Object3D() }, world.ecsWorld)
    addTransformComponentWithPosition(mapEntity, world, 0, 0, 0)
    addTransformComponentWithPosition(viewerEntity, world, 13, 0, 42)
    const oldObject3DComponent = getComponent(mapEntity, Object3DComponent, false, world.ecsWorld)
    const center = [0, 0]
    const minimumSceneRadius = 80
    const args = {}
    addComponent(
      mapEntity,
      MapComponent,
      {
        center,
        viewer: viewerEntity,
        triggerRefreshRadius: 20,
        refreshInProgress: false,
        minimumSceneRadius,
        args
      },
      world.ecsWorld
    )

    await refreshSceneObjects(mapEntity, world.ecsWorld)

    const newObject3DComponent = getComponent(mapEntity, Object3DComponent, false, world.ecsWorld)
    const mapTransformComponent = getComponent(mapEntity, TransformComponent, false, world.ecsWorld)
    const viewerTransformComponent = getComponent(viewerEntity, TransformComponent, false, world.ecsWorld)

    expect(createMapObjects).toHaveBeenCalledTimes(1)
    expect(createMapObjects).toHaveBeenCalledWith(center, minimumSceneRadius, args)
    // Test it was removed then added to trigger SceneObjectSystem enter/exit queries
    expect(newObject3DComponent).not.toBe(oldObject3DComponent)
    expect(newObject3DComponent.value).toBe(createMapObjectsMock.mock.results[0].value.mapMesh)
    expect(mapTransformComponent.position.equals(viewerTransformComponent.position)).toBe(true)
  })
})
