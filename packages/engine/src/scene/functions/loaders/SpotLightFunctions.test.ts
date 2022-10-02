import assert from 'assert'
import { Color, SpotLight, Vector2 } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
import { Object3DComponent } from '../../components/Object3DComponent'
import {
  SCENE_COMPONENT_SPOT_LIGHT_DEFAULT_VALUES,
  SpotLightComponent,
  SpotLightComponentType
} from '../../components/SpotLightComponent'
import {
  deserializeSpotLight,
  parseSpotLightProperties,
  serializeSpotLight,
  updateSpotLight
} from './SpotLightFunctions'

describe('SpotLightFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
    const node = createEntityNode(entity)
    const world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)
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

  describe('deserializeSpotLight()', () => {
    it('creates SpotLight Component with provided component data', () => {
      deserializeSpotLight(entity, sceneComponentData)
      updateSpotLight(entity)

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
      deserializeSpotLight(entity, sceneComponentData)
      updateSpotLight(entity)

      const obj3d = getComponent(entity, Object3DComponent)?.value
      assert(obj3d && obj3d instanceof SpotLight, 'SpotLight is not created')
      assert(obj3d.target.position.x === 0 && obj3d.target.position.y === -1 && obj3d.target.position.z === 0)
      assert(obj3d.children.includes(obj3d.target))
    })
  })

  describe('serializeSpotLight()', () => {
    it('should properly serialize spotlight', () => {
      deserializeSpotLight(entity, sceneComponentData)
      updateSpotLight(entity)
      assert.deepEqual(serializeSpotLight(entity), sceneComponentData)
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
})
