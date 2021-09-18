import { initializeEngine } from "../src/initializeEngine";
import { engineTestSetup } from "./util/setupEngine";
import { Group, Mesh, Quaternion, Vector3 } from 'three'
import { addComponent, createMappedComponent, defineQuery, getComponent } from '../src/ecs/functions/ComponentFunctions'
import { createEntity } from '../src/ecs/functions/EntityFunctions'
import { useWorld } from '../src/ecs/functions/SystemHooks'
import { ColliderComponent } from '../src/physics/components/ColliderComponent'
import { NameComponent } from '../src/scene/components/NameComponent'
import { Object3DComponent } from '../src/scene/components/Object3DComponent'
import { parseGLTFModel } from '../src/scene/functions/loadGLTFModel'
import { TransformComponent } from '../src/transform/components/TransformComponent'
import { WorldScene } from "../src/scene/functions/SceneLoading";
import { createCollider, createShape } from "../src/physics/functions/createCollider";
import { isTriggerShape } from "../src/physics/classes/Physics";


describe('Scene Loader', () => {

  // force close until we can reset the engine properly
  afterAll(async () => {
    setTimeout(() => process.exit(0), 1000)
  })

  test('Can load gltf metadata', async () => {

    const mockComponentData = { data: { src: '' } } as any
    const CustomComponent = createMappedComponent<{ value: number}>('CustomComponent')

    await initializeEngine(engineTestSetup)
    const sceneLoader = new WorldScene()

    const entity = createEntity()
    addComponent(entity, TransformComponent, { position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(1,1,1), })
    const entityName = 'entity name'
    const number = Math.random()
    const mesh = new Mesh()
    mesh.userData = {
      'realitypack.entity': entityName,
      'realitypack.box-collider.isTrigger': true,
      'realitypack.CustomComponent.value': number
    }
    const colliderQuery = defineQuery([NameComponent, TransformComponent, Object3DComponent, CustomComponent, ColliderComponent])
  
    parseGLTFModel(sceneLoader, entity, mockComponentData, undefined, mesh)

    const [loadedEntity] = colliderQuery(useWorld())
    expect(typeof loadedEntity).not.toBe('undefined')
    expect(getComponent(loadedEntity, NameComponent).name).toBe(entityName)
    expect(getComponent(loadedEntity, CustomComponent).value).toBe(number)
    const shape = useWorld().physics.getOriginalShapeObject(getComponent(loadedEntity, ColliderComponent).body.getShapes())
    expect(isTriggerShape(shape)).toBe(true)
  })

  // TODO
  test.skip('Can load physics objects from gltf metadata', async () => {

    const entity = createEntity()
    addComponent(entity, TransformComponent, { position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(1,1,1), })
    const entityName = 'physics test entity'
    const parentGroup = new Group()
    parentGroup.userData = {
      'realitypack.entity': entityName,
      'realitypack.collider.bodyType': 0,
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