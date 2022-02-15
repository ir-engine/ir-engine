import assert from 'assert'
import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { AmbientLight, Color } from 'three'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createWorld, World } from '../../../ecs/classes/World'
import { Engine } from '../../../ecs/classes/Engine'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import {
  deserializeAmbientLight,
  parseAmbientLightProperties,
  SCENE_COMPONENT_AMBIENT_LIGHT,
  SCENE_COMPONENT_AMBIENT_LIGHT_DEFAULT_VALUES,
  serializeAmbientLight,
  shouldDeserializeAmbientLight,
  updateAmbientLight
} from './AmbientLightFunctions'
import { Object3DComponent } from '../../components/Object3DComponent'
import { AmbientLightComponent, AmbientLightComponentType } from '../../components/AmbientLightComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { Entity } from '../../../ecs/classes/Entity'

describe('AmbientLightFunctions', () => {
  let world: World
  let entity: Entity

  beforeEach(() => {
    world = createWorld()
    Engine.currentWorld = world
    entity = createEntity()
  })

  const sceneComponentData = {
    color: new Color('red').getHex(),
    intensity: 5
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_AMBIENT_LIGHT,
    props: sceneComponentData
  }

  describe('deserializeAmbientLight()', () => {
    it('creates Ambient Light Component with provided component data', () => {
      deserializeAmbientLight(entity, sceneComponent)

      const ambientLightComponent = getComponent(entity, AmbientLightComponent) as AmbientLightComponentType
      assert(ambientLightComponent)
      assert(
        ambientLightComponent.color instanceof Color &&
          ambientLightComponent.color.getHex() === sceneComponentData.color
      )
      assert(ambientLightComponent.intensity === sceneComponentData.intensity)
    })

    it('creates Ambient Light Object3D with provided component data', () => {
      deserializeAmbientLight(entity, sceneComponent)

      const obj3d = getComponent(entity, Object3DComponent)?.value as AmbientLight
      assert(obj3d && obj3d instanceof AmbientLight, 'Ambient Light is not created')
      assert(obj3d.color instanceof Color && obj3d.color.getHex() === sceneComponentData.color)
      assert(obj3d.intensity === sceneComponentData.intensity)
    })

    describe('Editor vs Location', () => {
      it('creates Ambient light in Location', () => {
        addComponent(entity, EntityNodeComponent, { components: [] })

        deserializeAmbientLight(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(!entityNodeComponent.components.includes(SCENE_COMPONENT_AMBIENT_LIGHT))
      })

      it('creates Ambient light in Editor', () => {
        Engine.isEditor = true

        addComponent(entity, EntityNodeComponent, { components: [] })

        deserializeAmbientLight(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(entityNodeComponent.components.includes(SCENE_COMPONENT_AMBIENT_LIGHT))
        Engine.isEditor = false
      })
    })
  })

  describe('updateAmbientLight()', () => {
    let ambientLightComponent: AmbientLightComponentType
    let obj3d: AmbientLight

    beforeEach(() => {
      deserializeAmbientLight(entity, sceneComponent)
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
      deserializeAmbientLight(entity, sceneComponent)
      assert.deepEqual(serializeAmbientLight(entity), sceneComponent)
    })

    it('should return undefine if there is no ambient light component', () => {
      assert(serializeAmbientLight(entity) === undefined)
    })
  })

  describe('shouldDeserializeAmbientLight()', () => {
    it('should return true if there is no ambient light component in the world', () => {
      assert(shouldDeserializeAmbientLight())
      deserializeAmbientLight(entity, sceneComponent)
      assert.deepEqual(serializeAmbientLight(entity), sceneComponent)
    })

    it('should return false if there is atleast one ambient light component in the world', () => {
      deserializeAmbientLight(entity, sceneComponent)
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
