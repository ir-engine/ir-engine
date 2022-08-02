import assert from 'assert'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import {
  PositionalAudioSettingsComponent,
  PositionalAudioSettingsComponentType
} from '../../components/AudioSettingsComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import {
  deserializeAudioSetting,
  parseAudioSettingProperties,
  SCENE_COMPONENT_AUDIO_SETTINGS,
  SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES,
  serializeAudioSetting
} from './AudioSettingFunctions'

describe('AudioSettingFunctions', () => {
  let entity: Entity

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    coneInnerAngle: Math.random(),
    coneOuterAngle: Math.random(),
    coneOuterGain: Math.random(),
    distanceModel: 'distance model',
    maxDistance: Math.random(),
    refDistance: Math.random(),
    rolloffFactor: Math.random()
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_AUDIO_SETTINGS,
    props: sceneComponentData
  }

  describe('deserializeAudioSetting()', () => {
    it('creates Audio setting Component with provided component data', () => {
      deserializeAudioSetting(entity, sceneComponent)

      const ambientLightComponent = getComponent(
        entity,
        PositionalAudioSettingsComponent
      ) as PositionalAudioSettingsComponentType
      assert.deepEqual(ambientLightComponent, sceneComponentData)
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      deserializeAudioSetting(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_AUDIO_SETTINGS))

      assert(Engine.instance.spatialAudioSettings.distanceModel === sceneComponentData.distanceModel)
      assert(Engine.instance.spatialAudioSettings.rolloffFactor === sceneComponentData.rolloffFactor)
      assert(Engine.instance.spatialAudioSettings.refDistance === sceneComponentData.refDistance)
      assert(Engine.instance.spatialAudioSettings.maxDistance === sceneComponentData.maxDistance)
      assert(Engine.instance.spatialAudioSettings.coneInnerAngle === sceneComponentData.coneInnerAngle)
      assert(Engine.instance.spatialAudioSettings.coneOuterAngle === sceneComponentData.coneOuterAngle)
      assert(Engine.instance.spatialAudioSettings.coneOuterGain === sceneComponentData.coneOuterGain)
    })
  })

  describe('serializeAudioSetting()', () => {
    it('should properly serialize audio', async () => {
      deserializeAudioSetting(entity, sceneComponent)
      assert.deepEqual(serializeAudioSetting(entity), sceneComponent)
    })

    it('should return undefine if there is no audio component', () => {
      assert(serializeAudioSetting(entity) === undefined)
    })
  })

  describe('parseAudioProperties()', () => {
    it('should use default component values', () => {
      const componentData = parseAudioSettingProperties({})
      assert(componentData.distanceModel === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.distanceModel)
      assert(componentData.rolloffFactor === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.rolloffFactor)
      assert(componentData.refDistance === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.refDistance)
      assert(componentData.maxDistance === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.maxDistance)
      assert(componentData.coneInnerAngle === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.coneInnerAngle)
      assert(componentData.coneOuterAngle === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.coneOuterAngle)
      assert(componentData.coneOuterGain === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.coneOuterGain)
    })

    it('should use passed values', () => {
      const props = {
        distanceModel: 'distance model',
        rolloffFactor: Math.random(),
        refDistance: Math.random(),
        maxDistance: Math.random(),
        coneInnerAngle: Math.random(),
        coneOuterAngle: Math.random(),
        coneOuterGain: Math.random()
      }
      const componentData = parseAudioSettingProperties(props)

      assert(componentData.distanceModel === props.distanceModel)
      assert(componentData.rolloffFactor === props.rolloffFactor)
      assert(componentData.refDistance === props.refDistance)
      assert(componentData.maxDistance === props.maxDistance)
      assert(componentData.coneInnerAngle === props.coneInnerAngle)
      assert(componentData.coneOuterAngle === props.coneOuterAngle)
      assert(componentData.coneOuterGain === props.coneOuterGain)
    })
  })
})
