import assert from 'assert'
import { Color, Object3D, SpotLight, Vector2 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { SpotLightComponent, SpotLightComponentType } from '../../components/SpotLightComponent'
import { ObjectLayers } from '../../constants/ObjectLayers'
import {
  deserializeSpotLight,
  parseSpotLightProperties,
  prepareSpotLightForGLTFExport,
  SCENE_COMPONENT_SPOT_LIGHT,
  SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES,
  serializeSpotLight,
  updateSpotLight
} from './SpotLightFunctions'

describe('SpotLightFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    color: 0x123456,
    intensity: Math.random(),
    range: Math.random(),
    decay: Math.random(),
    angle: Math.random(),
    penumbra: Math.random(),
    castShadow: false,
    shadowMapResolution: [512, 512],
    shadowBias: Math.random(),
    shadowRadius: Math.random()
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_SPOT_LIGHT,
    props: sceneComponentData
  }

  describe('deserializeSpotLight()', () => {
    it('creates SpotLight Component with provided component data', () => {
      deserializeSpotLight(entity, sceneComponent)

      const spotlightComponent = getComponent(entity, SpotLightComponent)
      assert(spotlightComponent)
      assert(spotlightComponent.color.getHex() === sceneComponentData.color)
      assert(spotlightComponent.intensity === sceneComponentData.intensity)
      assert(spotlightComponent.range === sceneComponentData.range)
      assert(spotlightComponent.decay === sceneComponentData.decay)
      assert(spotlightComponent.angle === sceneComponentData.angle)
      assert(spotlightComponent.penumbra === sceneComponentData.penumbra)
      assert(spotlightComponent.castShadow === sceneComponentData.castShadow)
      assert(
        spotlightComponent.shadowMapResolution.x === sceneComponentData.shadowMapResolution[0] &&
          spotlightComponent.shadowMapResolution.y === sceneComponentData.shadowMapResolution[1]
      )
      assert(spotlightComponent.shadowBias === sceneComponentData.shadowBias)
      assert(spotlightComponent.shadowRadius === sceneComponentData.shadowRadius)
    })

    it('creates SpotLight Object3D with provided component data', () => {
      deserializeSpotLight(entity, sceneComponent)

      const obj3d = getComponent(entity, Object3DComponent)?.value
      assert(obj3d && obj3d instanceof SpotLight, 'SpotLight is not created')
      assert(obj3d.target.position.x === 0 && obj3d.target.position.y === -1 && obj3d.target.position.z === 0)
      assert(obj3d.children.includes(obj3d.target))

      assert(obj3d.children.includes(obj3d.userData.ring) && obj3d.userData.ring.userData.isHelper)
      assert(obj3d.children.includes(obj3d.userData.cone) && obj3d.userData.cone.userData.isHelper)
      assert(obj3d.userData.ring.layers.isEnabled(ObjectLayers.NodeHelper))
      assert(obj3d.userData.cone.layers.isEnabled(ObjectLayers.NodeHelper))
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      deserializeSpotLight(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_SPOT_LIGHT))
    })
  })

  describe('updateSpotLight()', () => {
    let spotLightComponent: SpotLightComponentType
    let obj3d: SpotLight

    beforeEach(() => {
      deserializeSpotLight(entity, sceneComponent)
      spotLightComponent = getComponent(entity, SpotLightComponent) as SpotLightComponentType
      obj3d = getComponent(entity, Object3DComponent)?.value as SpotLight
    })

    describe('Property tests for "color"', () => {
      it('should not update property', () => {
        updateSpotLight(entity, {})

        assert(spotLightComponent.color.getHex() === sceneComponentData.color)
        assert(obj3d.color.getHex() === sceneComponentData.color)
      })

      it('should update property', () => {
        const newColor = new Color('blue')
        spotLightComponent.color = newColor

        updateSpotLight(entity, { color: newColor })
        assert(obj3d.color.getHex() === newColor.getHex())

        updateSpotLight(entity, { color: new Color('green') })
        assert(obj3d.color.getHex() === newColor.getHex(), 'should not update property to passed value')
        assert(obj3d.userData.ring.material.color.getHex() === newColor.getHex())
        assert(obj3d.userData.cone.material.color.getHex() === newColor.getHex())
      })
    })

    describe('Property tests for "intensity"', () => {
      it('should not update property', () => {
        updateSpotLight(entity, {})

        assert(spotLightComponent.intensity === sceneComponentData.intensity)
        assert(obj3d.intensity === sceneComponentData.intensity)
      })

      it('should update property', () => {
        const newIntensity = Math.random()
        spotLightComponent.intensity = newIntensity

        updateSpotLight(entity, { intensity: newIntensity })
        assert(obj3d.intensity === newIntensity)

        updateSpotLight(entity, { intensity: Math.random() })
        assert(obj3d.intensity === newIntensity, 'should not update property to passed value')
      })
    })

    describe('Property tests for "range"', () => {
      it('should not update property', () => {
        updateSpotLight(entity, {})

        assert(spotLightComponent.range === sceneComponentData.range)
        assert(obj3d.distance === sceneComponentData.range)
      })

      it('should update property', () => {
        const newRange = Math.random()
        spotLightComponent.range = newRange

        updateSpotLight(entity, { range: newRange })
        assert(obj3d.distance === newRange)

        updateSpotLight(entity, { range: Math.random() })
        assert(obj3d.distance === newRange, 'should not update property to passed value')
      })
    })

    describe('Property tests for "decay"', () => {
      it('should not update property', () => {
        updateSpotLight(entity, {})

        assert(spotLightComponent.decay === sceneComponentData.decay)
        assert(obj3d.decay === sceneComponentData.decay)
      })

      it('should update property', () => {
        const newDecay = Math.random()
        spotLightComponent.decay = newDecay

        updateSpotLight(entity, { decay: newDecay })
        assert(obj3d.decay === newDecay)

        updateSpotLight(entity, { decay: Math.random() })
        assert(obj3d.decay === newDecay, 'should not update property to passed value')
      })
    })

    describe('Property tests for "penumbra"', () => {
      it('should not update property', () => {
        updateSpotLight(entity, {})

        assert(spotLightComponent.penumbra === sceneComponentData.penumbra)
        assert(obj3d.penumbra === sceneComponentData.penumbra)
      })

      it('should update property', () => {
        const newPenumbra = Math.random()
        spotLightComponent.penumbra = newPenumbra

        updateSpotLight(entity, { penumbra: newPenumbra })
        assert(obj3d.penumbra === newPenumbra)

        updateSpotLight(entity, { penumbra: Math.random() })
        assert(obj3d.penumbra === newPenumbra, 'should not update property to passed value')
      })
    })

    describe('Property tests for "angle"', () => {
      it('should not update property', () => {
        updateSpotLight(entity, {})

        assert(spotLightComponent.angle === sceneComponentData.angle)
        assert(obj3d.angle === sceneComponentData.angle)
      })

      it('should update property', () => {
        const newAngle = Math.random()
        spotLightComponent.angle = newAngle

        updateSpotLight(entity, { angle: newAngle })
        assert(obj3d.angle === newAngle)

        updateSpotLight(entity, { angle: Math.random() })
        assert(obj3d.angle === newAngle, 'should not update property to passed value')
      })
    })

    describe('Property tests for "castShadow"', () => {
      it('should not update property', () => {
        updateSpotLight(entity, {})

        assert(spotLightComponent.castShadow === sceneComponentData.castShadow)
        assert(obj3d.castShadow === sceneComponentData.castShadow)
      })

      it('should update property', () => {
        const newCastShadow = false
        spotLightComponent.castShadow = newCastShadow

        updateSpotLight(entity, { castShadow: newCastShadow })
        assert(obj3d.castShadow === newCastShadow)

        updateSpotLight(entity, { castShadow: true })
        assert(obj3d.castShadow === newCastShadow, 'should not update property to passed value')
      })
    })

    describe('Property tests for "shadowBias"', () => {
      it('should not update property', () => {
        updateSpotLight(entity, {})

        assert(spotLightComponent.shadowBias === sceneComponentData.shadowBias)
        assert(obj3d.shadow.bias === sceneComponentData.shadowBias)
      })

      it('should update property', () => {
        const newBias = Math.random()
        spotLightComponent.shadowBias = newBias

        updateSpotLight(entity, { shadowBias: newBias })
        assert(obj3d.shadow.bias === newBias)

        updateSpotLight(entity, { shadowBias: Math.random() })
        assert(obj3d.shadow.bias === newBias, 'should not update property to passed value')
      })
    })

    describe('Property tests for "shadowRadius"', () => {
      it('should not update property', () => {
        updateSpotLight(entity, {})

        assert(spotLightComponent.shadowRadius === sceneComponentData.shadowRadius)
        assert(obj3d.shadow.radius === sceneComponentData.shadowRadius)
      })

      it('should update property', () => {
        const newRadius = Math.random()
        spotLightComponent.shadowRadius = newRadius

        updateSpotLight(entity, { shadowRadius: newRadius })
        assert(obj3d.shadow.radius === newRadius)

        updateSpotLight(entity, { shadowRadius: Math.random() })
        assert(obj3d.shadow.radius === newRadius, 'should not update property to passed value')
      })
    })

    describe('Property tests for "shadowMapResolution"', () => {
      it('should not update property', () => {
        updateSpotLight(entity, {})

        assert(
          spotLightComponent.shadowMapResolution.x === sceneComponentData.shadowMapResolution[0] &&
            spotLightComponent.shadowMapResolution.y === sceneComponentData.shadowMapResolution[1]
        )
        assert(
          obj3d.shadow.mapSize.x === sceneComponentData.shadowMapResolution[0] &&
            obj3d.shadow.mapSize.y === sceneComponentData.shadowMapResolution[1]
        )
      })

      it('should update property', () => {
        const newMapSize = new Vector2(Math.random(), Math.random())
        spotLightComponent.shadowMapResolution = newMapSize

        updateSpotLight(entity, { shadowMapResolution: newMapSize })
        assert(obj3d.shadow.mapSize.x === newMapSize.x && obj3d.shadow.mapSize.y === newMapSize.y)

        obj3d.shadow.map = { dispose() {} } as any
        updateSpotLight(entity, { shadowMapResolution: new Vector2(Math.random(), Math.random()) })
        assert(
          obj3d.shadow.mapSize.x === newMapSize.x && obj3d.shadow.mapSize.y === newMapSize.y,
          'should not update property to passed value'
        )
      })
    })
  })

  describe('serializeSpotLight()', () => {
    it('should properly serialize spotlight', () => {
      deserializeSpotLight(entity, sceneComponent)
      assert.deepEqual(serializeSpotLight(entity), sceneComponent)
    })

    it('should return undefine if there is no spotlight component', () => {
      assert(serializeSpotLight(entity) === undefined)
    })
  })

  describe('parseSpotLightProperties()', () => {
    it('should use default component values', () => {
      const componentData = parseSpotLightProperties({})
      assert(componentData.color.getHex() === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.color)
      assert(componentData.intensity === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.intensity)
      assert(componentData.range === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.range)
      assert(componentData.decay === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.decay)
      assert(componentData.angle === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.angle)
      assert(componentData.penumbra === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.penumbra)
      assert(componentData.castShadow === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.castShadow)
      assert(
        componentData.shadowMapResolution.x === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.shadowMapResolution[0] &&
          componentData.shadowMapResolution.y === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.shadowMapResolution[1]
      )
      assert(componentData.shadowBias === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.shadowBias)
      assert(componentData.shadowRadius === SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES.shadowRadius)
    })

    it('should use passed values', () => {
      const componentData = parseSpotLightProperties({ ...sceneComponentData })
      assert(componentData.color.getHex() === sceneComponentData.color)
      assert(componentData.intensity === sceneComponentData.intensity)
      assert(componentData.range === sceneComponentData.range)
      assert(componentData.decay === sceneComponentData.decay)
      assert(componentData.angle === sceneComponentData.angle)
      assert(componentData.penumbra === sceneComponentData.penumbra)
      assert(componentData.castShadow === sceneComponentData.castShadow)
      assert(
        componentData.shadowMapResolution.x === sceneComponentData.shadowMapResolution[0] &&
          componentData.shadowMapResolution.y === sceneComponentData.shadowMapResolution[1]
      )
      assert(componentData.shadowBias === sceneComponentData.shadowBias)
      assert(componentData.shadowRadius === sceneComponentData.shadowRadius)
    })
  })

  describe('prepareSpotLightForGLTFExport()', () => {
    let spotlight: SpotLight
    let ring: Object3D = new Object3D()
    let cone: Object3D = new Object3D()

    describe('Ring helper', () => {
      beforeEach(() => {
        spotlight = new SpotLight()
        ring = new Object3D()
        spotlight.userData.ring = ring
        spotlight.add(ring)
      })

      it('should remove helper model', () => {
        prepareSpotLightForGLTFExport(spotlight)
        assert(!spotlight.children.includes(ring))
        assert(!spotlight.userData.ring)
      })
    })

    describe('Cone Helper', () => {
      beforeEach(() => {
        spotlight = new SpotLight()
        cone = new Object3D()
        spotlight.userData.cone = cone
        spotlight.add(cone)
      })

      it('should remove helper box', () => {
        prepareSpotLightForGLTFExport(spotlight)
        assert(!spotlight.children.includes(spotlight.userData.cone))
        assert(!spotlight.userData.cone)
      })
    })
  })
})
