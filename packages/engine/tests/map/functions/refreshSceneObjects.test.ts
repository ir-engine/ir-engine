import refreshSceneObjects from '../../../src/map/functions/refreshSceneObjects'
import { createMapObjects } from '../../../src/map'
import { Object3D, Quaternion, Vector3 } from 'three'
import { addComponent, createEntity, getComponent } from '../../../src/ecs/functions/EntityFunctions'
import { Object3DComponent } from '../../../src/scene/components/Object3DComponent'
import { World } from '../../../src/ecs/classes/World'
import { Entity } from '../../../src/ecs/classes/Entity'
import { MapComponent } from '../../../src/map/MapComponent'
import { TransformComponent } from '../../../src/transform/components/TransformComponent'
import {GeoLabelSetComponent} from '../../../src/map/GeoLabelSetComponent'

const createMapObjectsMock = createMapObjects as jest.Mock
const $vector3 = new Vector3()

jest.mock('../../../src/map', () => {
  return {
    createMapObjects: jest.fn(() => {
      return {
        mapMesh: new Object3D(),
        labels: [
          { object3d: new Object3D() }
        ]
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
    addComponent(mapEntity, GeoLabelSetComponent, { value: new Set([{object3d: new Object3D}]) }, world.ecsWorld)
    addTransformComponentWithPosition(mapEntity, world, 0, 0, 0)
    addTransformComponentWithPosition(viewerEntity, world, 13, 3, 42)
    const center = [0, 0]
    const minimumSceneRadius = 80
    const args = {}
    addComponent(
      mapEntity,
      MapComponent,
      {
        center,
        triggerRefreshRadius: 20,
        refreshInProgress: false,
        minimumSceneRadius,
        args
      },
      world.ecsWorld
    )

    await refreshSceneObjects(mapEntity, viewerEntity, world.ecsWorld)

    const newObject3DComponent = getComponent(mapEntity, Object3DComponent, false, world.ecsWorld)
    const mapTransformComponent = getComponent(mapEntity, TransformComponent, false, world.ecsWorld)
    const viewerTransformComponent = getComponent(viewerEntity, TransformComponent, false, world.ecsWorld)

    expect(createMapObjects).toHaveBeenCalledTimes(1)
    expect(createMapObjects).toHaveBeenCalledWith(center, minimumSceneRadius, args)
    expect(newObject3DComponent.value.children[0]).toBe(createMapObjectsMock.mock.results[0].value.mapMesh)
    $vector3.copy(viewerTransformComponent.position)
    $vector3.y = 0
    expect(mapTransformComponent.position.equals($vector3)).toBe(true)
  })
})
