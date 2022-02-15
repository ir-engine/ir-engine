import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import assert from 'assert'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { createWorld, World } from '../../../ecs/classes/World'
import { addComponent, getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
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
  let world: World
  let entity: Entity

  beforeEach(() => {
    world = createWorld()
    Engine.currentWorld = world
    Engine.isEditor = false
    entity = createEntity()
  })

  const sceneComponentData = {
    avatarDistanceModel: 'avatar distance model',
    avatarMaxDistance: Math.random(),
    avatarRefDistance: Math.random(),
    avatarRolloffFactor: Math.random(),
    mediaConeInnerAngle: Math.random(),
    mediaConeOuterAngle: Math.random(),
    mediaConeOuterGain: Math.random(),
    mediaDistanceModel: 'distance model',
    mediaMaxDistance: Math.random(),
    mediaRefDistance: Math.random(),
    mediaRolloffFactor: Math.random(),
    mediaVolume: Math.random(),
    usePositionalAudio: true
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

    describe('Editor vs Location', () => {
      it('creates Audio setting component in Location', () => {
        addComponent(entity, EntityNodeComponent, { components: [] })

        deserializeAudioSetting(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(!entityNodeComponent.components.includes(SCENE_COMPONENT_AUDIO_SETTINGS))
      })

      it('creates Audio setting component in Editor', () => {
        Engine.isEditor = true

        addComponent(entity, EntityNodeComponent, { components: [] })

        deserializeAudioSetting(entity, sceneComponent)

        const entityNodeComponent = getComponent(entity, EntityNodeComponent)
        assert(entityNodeComponent.components.includes(SCENE_COMPONENT_AUDIO_SETTINGS))
      })
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
      assert(componentData.usePositionalAudio === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.usePositionalAudio)
      assert(componentData.avatarDistanceModel === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.avatarDistanceModel)
      assert(componentData.avatarRolloffFactor === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.avatarRolloffFactor)
      assert(componentData.avatarRefDistance === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.avatarRefDistance)
      assert(componentData.avatarMaxDistance === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.avatarMaxDistance)
      assert(componentData.mediaVolume === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaVolume)
      assert(componentData.mediaDistanceModel === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaDistanceModel)
      assert(componentData.mediaRolloffFactor === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaRolloffFactor)
      assert(componentData.mediaRefDistance === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaRefDistance)
      assert(componentData.mediaMaxDistance === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaMaxDistance)
      assert(componentData.mediaConeInnerAngle === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaConeInnerAngle)
      assert(componentData.mediaConeOuterAngle === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaConeOuterAngle)
      assert(componentData.mediaConeOuterGain === SCENE_COMPONENT_AUDIO_SETTINGS_DEFAULT_VALUES.mediaConeOuterGain)
    })

    it('should use passed values', () => {
      const props = {
        avatarDistanceModel: 'avatar distance model',
        avatarMaxDistance: Math.random(),
        avatarRefDistance: Math.random(),
        avatarRolloffFactor: Math.random(),
        mediaConeInnerAngle: Math.random(),
        mediaConeOuterAngle: Math.random(),
        mediaConeOuterGain: Math.random(),
        mediaDistanceModel: 'distance model',
        mediaMaxDistance: Math.random(),
        mediaRefDistance: Math.random(),
        mediaRolloffFactor: Math.random(),
        mediaVolume: Math.random(),
        usePositionalAudio: true
      }
      const componentData = parseAudioSettingProperties(props)

      assert(componentData.usePositionalAudio === props.usePositionalAudio)
      assert(componentData.avatarDistanceModel === props.avatarDistanceModel)
      assert(componentData.avatarRolloffFactor === props.avatarRolloffFactor)
      assert(componentData.avatarRefDistance === props.avatarRefDistance)
      assert(componentData.avatarMaxDistance === props.avatarMaxDistance)
      assert(componentData.mediaVolume === props.mediaVolume)
      assert(componentData.mediaDistanceModel === props.mediaDistanceModel)
      assert(componentData.mediaRolloffFactor === props.mediaRolloffFactor)
      assert(componentData.mediaRefDistance === props.mediaRefDistance)
      assert(componentData.mediaMaxDistance === props.mediaMaxDistance)
      assert(componentData.mediaConeInnerAngle === props.mediaConeInnerAngle)
      assert(componentData.mediaConeOuterAngle === props.mediaConeOuterAngle)
      assert(componentData.mediaConeOuterGain === props.mediaConeOuterGain)
    })
  })
})
