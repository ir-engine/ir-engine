import assert from 'assert'
import { Mesh, MeshBasicMaterial } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ShadowComponent, ShadowComponentType } from '../../components/ShadowComponent'
import { deserializeShadow, SCENE_COMPONENT_SHADOW, serializeShadow, updateShadow } from './ShadowFunctions'

describe('ShadowFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    cast: true,
    receive: true
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_SHADOW,
    props: sceneComponentData
  }

  describe('deserializeShadow()', () => {
    it('creates Shadow Component with default component data', () => {
      deserializeShadow(entity, { ...sceneComponent, props: {} })

      const shadowComponent = getComponent(entity, ShadowComponent)
      assert(shadowComponent)
      assert(
        shadowComponent.castShadow === sceneComponentData.cast &&
          shadowComponent.receiveShadow === sceneComponentData.receive
      )
    })

    it('creates Shadow Component with provided component data', () => {
      deserializeShadow(entity, sceneComponent)

      const shadowComponent = getComponent(entity, ShadowComponent)
      assert(shadowComponent)
      assert(
        shadowComponent.castShadow === sceneComponentData.cast &&
          shadowComponent.receiveShadow === sceneComponentData.receive
      )
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      deserializeShadow(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_SHADOW))
    })
  })

  describe('updateShadow()', () => {
    let shadowComponent: ShadowComponentType
    let obj3d: Mesh
    let child: Mesh

    beforeEach(() => {
      obj3d = new Mesh()
      child = new Mesh()

      obj3d.material = new MeshBasicMaterial()
      child.material = [new MeshBasicMaterial(), new MeshBasicMaterial()]

      obj3d.add(child)

      addComponent(entity, Object3DComponent, { value: obj3d })
      deserializeShadow(entity, sceneComponent)
      shadowComponent = getComponent(entity, ShadowComponent) as ShadowComponentType
    })

    describe('Property tests for "castShadow"', () => {
      it('should update shadow properties of the object', () => {
        shadowComponent.castShadow = false
        updateShadow(entity)
        obj3d.traverse((obj) => {
          assert(obj.castShadow === shadowComponent.castShadow)
        })

        shadowComponent.castShadow = true
        updateShadow(entity)
        obj3d.traverse((obj) => {
          assert(obj.castShadow === shadowComponent.castShadow)
        })
      })
    })

    describe('Property tests for "receiveShadow"', () => {
      it('should update shadow properties of the object', () => {
        shadowComponent.receiveShadow = false
        updateShadow(entity)
        obj3d.traverse((obj) => {
          assert(obj.receiveShadow === shadowComponent.receiveShadow)
        })

        shadowComponent.receiveShadow = true
        updateShadow(entity)
        obj3d.traverse((obj) => {
          assert(obj.receiveShadow === shadowComponent.receiveShadow)
        })
      })
    })
  })

  describe('serializeShadow()', () => {
    it('should properly serialize shadow', () => {
      deserializeShadow(entity, sceneComponent)
      assert.deepEqual(serializeShadow(entity), sceneComponent)
    })

    it('should return undefine if there is no shadow component', () => {
      assert(serializeShadow(entity) === undefined)
    })
  })
})
