import { Group, Layers, Mesh, Quaternion, Scene, Vector3 } from 'three'
import { addComponent, createMappedComponent, defineQuery, getComponent, hasComponent } from '../../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../../src/ecs/functions/EntityFunctions'
import { ColliderComponent } from '../../src/physics/components/ColliderComponent'
import { NameComponent } from '../../src/scene/components/NameComponent'
import { Object3DComponent } from '../../src/scene/components/Object3DComponent'
import { parseGLTFModel } from '../../src/scene/functions/loadGLTFModel'
import { TransformComponent } from '../../src/transform/components/TransformComponent'
import { WorldScene } from "../../src/scene/functions/SceneLoading"
import { isTriggerShape } from "../../src/physics/classes/Physics"
import assert from 'assert'
import { createWorld } from "../../src/ecs/classes/World"
import { ObjectLayers } from '../../src/scene/constants/ObjectLayers'
import { SpawnPointComponent } from '../../src/scene/components/SpawnPointComponent'
import { useEngine } from '../../src/ecs/classes/Engine'

describe('loadGLTFModel', () => {

  // force close until we can reset the engine properly
  // after(async () => {
  //   setTimeout(() => process.exit(0), 1000)
  // })

  // TODO: - this needs to be broken down and more comprehensive
  it('loadGLTFModel', async () => {

    const world = createWorld()
    useEngine().currentWorld = world
	
    const mockComponentData = { data: { src: '' } } as any
    const CustomComponent = createMappedComponent<{ value: number }>('CustomComponent')

    // await initializeEngine(engineTestSetup)
    const sceneLoader = new WorldScene()

    const entity = createEntity()
    addComponent(entity, TransformComponent, { position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(1, 1, 1), })
    const entityName = 'entity name'
    const number = Math.random()
    const scene = new Scene()
    const mesh = new Mesh()
    mesh.userData = {
      'xrengine.entity': entityName,
      'xrengine.spawn-point': '',
      'xrengine.CustomComponent.value': number
    }
    scene.add(mesh)
    const modelQuery = defineQuery([TransformComponent, Object3DComponent])
    const childQuery = defineQuery([NameComponent, TransformComponent, Object3DComponent, CustomComponent, SpawnPointComponent])

    parseGLTFModel(sceneLoader, entity, mockComponentData, undefined!, scene)
    
    const expectedLayer = new Layers()
    expectedLayer.set(ObjectLayers.Scene)

    const [mockModelEntity] = modelQuery(world)
    const [mockSpawnPointEntity] = childQuery(world)

    assert.equal(typeof mockModelEntity, 'number')
    assert(getComponent(mockModelEntity, Object3DComponent).value.layers.test(expectedLayer))

    assert(hasComponent(mockSpawnPointEntity,SpawnPointComponent))
    assert.equal(getComponent(mockSpawnPointEntity, CustomComponent).value, number)
    assert.equal(getComponent(mockSpawnPointEntity, NameComponent).name, entityName)
    assert(getComponent(mockSpawnPointEntity, Object3DComponent).value.layers.test(expectedLayer))
  })

  // TODO
  it.skip('Can load physics objects from gltf metadata', async () => {

    const world = createWorld()
	
    const entity = createEntity()
    addComponent(entity, TransformComponent, { position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(1, 1, 1), })
    const entityName = 'physics test entity'
    const parentGroup = new Group()
    parentGroup.userData = {
      'xrengine.entity': entityName,
      'xrengine.collider.bodyType': 0,
    }

    const mesh = new Mesh()
    mesh.userData = {
      'type': 'box'
    }
    parentGroup.add(mesh)


    // createShape()
    // createCollider()


  })

})
