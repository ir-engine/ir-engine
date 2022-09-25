import assert from 'assert'
import { AmbientLight, Color } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
import {
  AmbientLightComponent,
  AmbientLightComponentType,
  SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES
} from '../../components/AmbientLightComponent'
import {
  deserializeAmbientLight,
  parseAmbientLightProperties,
  serializeAmbientLight,
  shouldDeserializeAmbientLight,
  updateAmbientLight
} from './AmbientLightFunctions'

describe('AmbientLightFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    const node = createEntityNode(entity)
    const world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)
  })

  const sceneComponentData = {
    color: new Color('red').getHex(),
    intensity: 5
  }

  describe('deserializeAmbientLight()', () => {
    it('creates Ambient Light Component with provided component data', () => {
      deserializeAmbientLight(entity, sceneComponentData)
      updateAmbientLight(entity)

      const ambientLightComponent = getComponent(entity, AmbientLightComponent) as AmbientLightComponentType
      assert(ambientLightComponent)
      assert.equal(
        ambientLightComponent.color instanceof Color && ambientLightComponent.color.getHex(),
        sceneComponentData.color
      )
      assert.equal(ambientLightComponent.intensity, sceneComponentData.intensity)
    })

    it('creates Ambient Light Object3D with provided component data', () => {
      deserializeAmbientLight(entity, sceneComponentData)
      updateAmbientLight(entity)

      const obj3d = getComponent(entity, AmbientLightComponent)?.light
      assert(obj3d && obj3d instanceof AmbientLight, 'Ambient Light is not created')
      assert(obj3d.color instanceof Color)
      assert.equal(obj3d.color.getHex(), sceneComponentData.color)
      assert.equal(obj3d.intensity, sceneComponentData.intensity)
    })
  })

  describe('serializeAmbientLight()', () => {
    it('should properly serialize ambient light', () => {
      deserializeAmbientLight(entity, sceneComponentData)
      assert.deepEqual(serializeAmbientLight(entity), sceneComponentData)
    })

    it('should return undefine if there is no ambient light component', () => {
      assert(serializeAmbientLight(entity) === undefined)
    })
  })

  describe('shouldDeserializeAmbientLight()', () => {
    it('should return true if there is no ambient light component in the world', () => {
      assert(shouldDeserializeAmbientLight())
      deserializeAmbientLight(entity, sceneComponentData)
      assert.deepEqual(serializeAmbientLight(entity), sceneComponentData)
    })

    it('should return false if there is atleast one ambient light component in the world', () => {
      deserializeAmbientLight(entity, sceneComponentData)
      assert(!shouldDeserializeAmbientLight())
    })
  })

  describe('parseAmbientLightProperties()', () => {
    it('should use default component values', () => {
      const componentData = parseAmbientLightProperties({})
      assert('#' + componentData.color.getHexString() === SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES.color)
      assert(componentData.intensity === SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES.intensity)
    })

    it('should use passed values', () => {
      const componentData = parseAmbientLightProperties({ color: '#111111', intensity: 8 })
      assert('#' + componentData.color.getHexString() === '#111111')
      assert(componentData.intensity === 8)
    })
  })
})
