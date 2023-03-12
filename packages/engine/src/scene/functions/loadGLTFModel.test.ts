import assert from 'assert'
import { Group, Layers, Mesh, Scene } from 'three'

import { createMockNetwork } from '../../../tests/util/createMockNetwork'
import { destroyEngine, Engine } from '../../ecs/classes/Engine'
import {
  addComponent,
  createMappedComponent,
  defineComponent,
  defineQuery,
  getComponent,
  getMutableComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../ecs/functions/EntityFunctions'
import { addEntityNodeChild } from '../../ecs/functions/EntityTree'
import { createEngine } from '../../initializeEngine'
import { setLocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { addObjectToGroup, GroupComponent } from '../components/GroupComponent'
import { ModelComponent } from '../components/ModelComponent'
import { NameComponent } from '../components/NameComponent'
import { ObjectLayers } from '../constants/ObjectLayers'
import { parseGLTFModel } from './loadGLTFModel'

describe('loadGLTFModel', () => {
  beforeEach(() => {
    createEngine()
    createMockNetwork()
  })

  afterEach(() => {
    return destroyEngine()
  })

  // TODO: - this needs to be broken down and more comprehensive
  it('loadGLTFModel', async () => {
    const world = Engine.instance.currentScene

    const mockComponentData = { src: '' } as any
    const CustomComponent = defineComponent({
      name: 'CustomComponent',
      onInit(entity) {
        return {
          val: 0
        }
      },
      onSet(entity, component, json) {
        if (!json) return
        if (typeof json.val === 'number') component.val.set(json.val)
      }
    })

    const entity = createEntity()
    addEntityNodeChild(entity, world.sceneEntity)
    setLocalTransformComponent(entity, world.sceneEntity)
    addComponent(entity, ModelComponent, {
      ...mockComponentData
    })
    const entityName = 'entity name'
    const number = Math.random()
    const mesh = new Scene()
    mesh.userData = {
      'xrengine.entity': entityName,
      // 'xrengine.spawn-point': '',
      'xrengine.CustomComponent.val': number
    }
    const modelComponent = getMutableComponent(entity, ModelComponent)
    modelComponent.scene.set(mesh)
    addObjectToGroup(entity, mesh)
    const modelQuery = defineQuery([TransformComponent, GroupComponent])
    const childQuery = defineQuery([
      NameComponent,
      TransformComponent,
      GroupComponent,
      CustomComponent /*, SpawnPointComponent*/
    ])

    parseGLTFModel(entity)

    const expectedLayer = new Layers()
    expectedLayer.set(ObjectLayers.Scene)

    const [mockModelEntity] = modelQuery()
    const [mockSpawnPointEntity] = childQuery()

    assert.equal(typeof mockModelEntity, 'number')
    assert(getComponent(mockModelEntity, GroupComponent)[0].layers.test(expectedLayer))

    // assert(hasComponent(mockSpawnPointEntity, SpawnPointComponent))
    assert.equal(getComponent(mockSpawnPointEntity, CustomComponent).val, number)
    assert.equal(getComponent(mockSpawnPointEntity, NameComponent), entityName)
    assert(getComponent(mockSpawnPointEntity, GroupComponent)[0].layers.test(expectedLayer))
  })

  // TODO
  it.skip('Can load physics objects from gltf metadata', async () => {
    const entity = createEntity()
    const entityName = 'physics test entity'
    const parentGroup = new Group()
    parentGroup.userData = {
      'xrengine.entity': entityName,
      'xrengine.collider.bodyType': 0
    }

    const mesh = new Mesh()
    mesh.userData = {
      type: 'box'
    }
    parentGroup.add(mesh)

    // createShape()
    // createCollider()
  })
})
