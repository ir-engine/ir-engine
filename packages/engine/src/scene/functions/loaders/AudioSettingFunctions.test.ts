import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'
import assert from 'assert'
import { Engine } from '../../../ecs/classes/Engine'
import { createWorld } from '../../../ecs/classes/World'
import { getComponent, hasComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { PositionalAudioSettingsComponent } from '../../components/AudioSettingsComponent'
import { deserializeAudioSetting } from './AudioSettingFunctions'

describe('AudioSettingFunctions', () => {
  it('deserializeAudioSetting', () => {
    const world = createWorld()
    Engine.currentWorld = world
    const entity = createEntity()

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
      name: 'audio-settings',
      props: sceneComponentData
    }

    deserializeAudioSetting(entity, sceneComponent)

    assert(hasComponent(entity, PositionalAudioSettingsComponent))
    const component = getComponent(entity, PositionalAudioSettingsComponent)
    assert.equal(sceneComponentData.avatarDistanceModel, component.avatarDistanceModel)
    assert.equal(sceneComponentData.avatarMaxDistance, component.avatarMaxDistance)
    assert.equal(sceneComponentData.avatarRefDistance, component.avatarRefDistance)
    assert.equal(sceneComponentData.avatarRolloffFactor, component.avatarRolloffFactor)
    assert.equal(sceneComponentData.mediaConeInnerAngle, component.mediaConeInnerAngle)
    assert.equal(sceneComponentData.mediaConeOuterAngle, component.mediaConeOuterAngle)
    assert.equal(sceneComponentData.mediaConeOuterGain, component.mediaConeOuterGain)
    assert.equal(sceneComponentData.mediaDistanceModel, component.mediaDistanceModel)
    assert.equal(sceneComponentData.mediaMaxDistance, component.mediaMaxDistance)
    assert.equal(sceneComponentData.mediaRefDistance, component.mediaRefDistance)
    assert.equal(sceneComponentData.mediaRolloffFactor, component.mediaRolloffFactor)
    assert.equal(sceneComponentData.mediaVolume, component.mediaVolume)
    assert.equal(sceneComponentData.usePositionalAudio, component.usePositionalAudio)
  })
})
