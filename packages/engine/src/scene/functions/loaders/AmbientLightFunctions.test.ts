import assert from 'assert'
import { AmbientLight, Color } from 'three'

import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import {
  AmbientLightComponent,
  AmbientLightComponentType,
  SCENE_COMPONENT_AMBIENT_LIGHT,
  SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES
} from '../../components/AmbientLightComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
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

      const obj3d = getComponent(entity, Object3DComponent)?.value as AmbientLight
      assert(obj3d && obj3d instanceof AmbientLight, 'Ambient Light is not created')
      assert(obj3d.color instanceof Color)
      assert.equal(obj3d.color.getHex(), sceneComponentData.color)
      assert.equal(obj3d.intensity, sceneComponentData.intensity)
    })
  })

  describe('updateAmbientLight()', () => {
    let ambientLightComponent: AmbientLightComponentType
    let obj3d: AmbientLight

    beforeEach(() => {
      deserializeAmbientLight(entity, sceneComponentData)
      ambientLightComponent = getComponent(entity, AmbientLightComponent) as AmbientLightComponentType
      obj3d = getComponent(entity, Object3DComponent)?.value as AmbientLight
    })

    describe('Property tests for "color"', () => {
      it('should not update property', () => {
        updateAmbientLight(entity, {})

        assert(ambientLightComponent.color.getHex() === sceneComponentData.color)
        assert(obj3d.color.getHex() === sceneComponentData.color)
      })

      it('should update property', () => {
        const newColor = new Color('blue')
        ambientLightComponent.color = newColor

        updateAmbientLight(entity, { color: newColor })
        assert(obj3d.color.getHex() === newColor.getHex())

        updateAmbientLight(entity, { color: new Color('green') })
        assert(obj3d.color.getHex() === newColor.getHex(), 'should not update property to passed value')
      })
    })

    describe('Property tests for "intensity"', () => {
      it('should not update property', () => {
        updateAmbientLight(entity, {})

        assert(ambientLightComponent.intensity === sceneComponentData.intensity)
        assert(obj3d.intensity === sceneComponentData.intensity)
      })

      it('should update property', () => {
        const newIntensity = 10
        ambientLightComponent.intensity = newIntensity
        updateAmbientLight(entity, { intensity: newIntensity })

        assert(obj3d.intensity === newIntensity)

        updateAmbientLight(entity, { intensity: 20 })
        assert(obj3d.intensity === newIntensity, 'should not update property to passed value')
      })
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
