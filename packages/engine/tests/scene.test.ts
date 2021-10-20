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
import { isTriggerShape } from "../src/physics/classes/Physics";
import assert from 'assert'

describe('Scene Loader', () => {

  // force close until we can reset the engine properly
  after(async () => {
    setTimeout(() => process.exit(0), 1000)
  })

  it('Can load gltf metadata', async () => {

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
      'project.entity': entityName,
      'project.box-collider.isTrigger': true,
      'project.CustomComponent.value': number
    }
    const colliderQuery = defineQuery([NameComponent, TransformComponent, Object3DComponent, CustomComponent, ColliderComponent])
  
    parseGLTFModel(sceneLoader, entity, mockComponentData, undefined!, mesh)

    const [loadedEntity] = colliderQuery(useWorld())
    assert.equal(typeof loadedEntity, 'number')
    assert.equal(getComponent(loadedEntity, NameComponent).name, entityName)
    assert.equal(getComponent(loadedEntity, CustomComponent).value, number)
    const shape = useWorld().physics.getOriginalShapeObject(getComponent(loadedEntity, ColliderComponent).body.getShapes())
    assert.equal(isTriggerShape(shape!), true)
  })

  // TODO
  it.skip('Can load physics objects from gltf metadata', async () => {

    const entity = createEntity()
    addComponent(entity, TransformComponent, { position: new Vector3(), rotation: new Quaternion(), scale: new Vector3(1,1,1), })
    const entityName = 'physics test entity'
    const parentGroup = new Group()
    parentGroup.userData = {
      'project.entity': entityName,
      'project.collider.bodyType': 0,
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
