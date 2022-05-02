import assert from 'assert'
import { Object3D, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { InteractableComponent, InteractableComponentType } from '../../../interaction/components/InteractableComponent'
import { TransformComponent, TransformComponentType } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import {
  deserializeWorldData,
  SCENE_COMPONENT_WORLDDATA,
  serializeWorldData,
  updateWorldData
} from './WorldDataFunctions'

describe('WorldDataFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    addComponent(entity, TransformComponent, {
      position: new Vector3(Math.random(), Math.random(), Math.random())
    } as TransformComponentType)
  })

  const sceneComponentData = {
    data: 'Some random string'
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_WORLDDATA,
    props: sceneComponentData
  }

  describe('deserializeWorldData()', () => {
    it('creates Interactable Component with provided component data', () => {
      deserializeWorldData(entity, sceneComponent)

      const component = getComponent(entity, InteractableComponent)
      assert(component.value)
      assert(component.action.value === '_metadata')
      assert(component.interactionUserData.value === sceneComponentData.data)
    })

    it('creates Interactable Component with empty component data', () => {
      deserializeWorldData(entity, { ...sceneComponent, props: {} })

      const component = getComponent(entity, InteractableComponent)
      assert(component.value)
      assert(component.action.value === '_metadata')
      assert(component.interactionUserData.value === '')
    })

    it('creates Object3D with provided component data', () => {
      deserializeWorldData(entity, sceneComponent)

      const obj3d = getComponent(entity, Object3DComponent)?.value
      assert(obj3d, 'World Data object is not created')
      assert((obj3d as any)._data === sceneComponentData.data)
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      deserializeWorldData(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_WORLDDATA))
    })
  })

  describe('updateWorldData()', () => {
    let interactableComponent: InteractableComponentType
    let obj3d: Object3D

    beforeEach(() => {
      deserializeWorldData(entity, sceneComponent)
      interactableComponent = getComponent(entity, InteractableComponent).value
      obj3d = getComponent(entity, Object3DComponent)?.value
    })

    it('should not update property', () => {
      const world = Engine.instance.currentWorld
      updateWorldData(entity, {})
      const { x, y, z } = getComponent(entity, TransformComponent).position

      assert(interactableComponent.interactionUserData === sceneComponentData.data)
      assert(interactableComponent.action === '_metadata')
      assert(world.worldMetadata[sceneComponentData.data] === x + ',' + y + ',' + z)
    })

    it('should update property', () => {
      const world = Engine.instance.currentWorld
      const props = { data: 'Some other random string' }
      const position = getComponent(entity, TransformComponent).position
      position.set(Math.random(), Math.random(), Math.random())
      updateWorldData(entity, props)

      assert(interactableComponent.interactionUserData === props.data)
      assert(interactableComponent.action === '_metadata')
      assert((obj3d as any)._data === props.data)
      assert(world.worldMetadata[props.data] === position.x + ',' + position.y + ',' + position.z)
    })
  })

  describe('serializeWorldData()', () => {
    it('should properly serialize world data', () => {
      deserializeWorldData(entity, sceneComponent)
      assert.deepEqual(serializeWorldData(entity), sceneComponent)
    })

    it('should return undefine if there is no world data component', () => {
      assert(serializeWorldData(entity) === undefined)
    })
  })
})
