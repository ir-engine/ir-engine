import { MathUtils } from 'three'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { ClientStorage } from '../common/classes/ClientStorage'
import { Engine } from '../ecs/classes/Engine'
import { AudioSettingKeys } from './AudioSettingConstants'

/**
 * All values ranged from 0 to 1
 */
export const AudioState = defineState({
  name: 'AudioState',
  initial: () => ({
    masterVolume: 0.5,
    microphoneGain: 0.5,
    usePositionalMedia: false, // only for avatars - @todo make this `auto, on, off`
    mediaStreamVolume: 0.5,
    notificationVolume: 0.5,
    soundEffectsVolume: 0.2,
    backgroundMusicVolume: 0.2
  })
})

export function restoreAudioSettings() {
  ClientStorage.get(AudioSettingKeys.AUDIO).then((v: number) => {
    if (typeof v !== 'undefined')
      dispatchAction(AudioSettingAction.setMasterVolume({ value: MathUtils.clamp(v, 0, 1) }))
  })
  ClientStorage.get(AudioSettingKeys.MICROPHONE).then((v: number) => {
    if (typeof v !== 'undefined')
      dispatchAction(AudioSettingAction.setMicrophoneVolume({ value: MathUtils.clamp(v, 0, 1) }))
  })
  ClientStorage.get(AudioSettingKeys.USE_POSITIONAL_MEDIA).then((v: boolean) => {
    if (typeof v !== 'undefined') dispatchAction(AudioSettingAction.setUsePositionalMedia({ value: Boolean(v) }))
  })
  ClientStorage.get(AudioSettingKeys.MEDIA_STREAM_VOLUME).then((v: number) => {
    if (typeof v !== 'undefined')
      dispatchAction(AudioSettingAction.setMediaStreamVolume({ value: MathUtils.clamp(v, 0, 1) }))
  })
  ClientStorage.get(AudioSettingKeys.NOTIFICATION_VOLUME).then((v: number) => {
    if (typeof v !== 'undefined')
      dispatchAction(AudioSettingAction.setNotificationVolume({ value: MathUtils.clamp(v, 0, 1) }))
  })
  ClientStorage.get(AudioSettingKeys.SOUND_EFFECT_VOLUME).then((v: number) => {
    if (typeof v !== 'undefined')
      dispatchAction(AudioSettingAction.setSoundEffectsVolume({ value: MathUtils.clamp(v, 0, 1) }))
  })
  ClientStorage.get(AudioSettingKeys.BACKGROUND_MUSIC_VOLUME).then((v: number) => {
    if (typeof v !== 'undefined') dispatchAction(AudioSettingAction.setMusicVolume({ value: MathUtils.clamp(v, 0, 1) }))
  })
}

export const accessAudioState = () => getState(AudioState)
export const useAudioState = () => useState(accessAudioState())

export function AudioSettingReceptor(action) {
  const s = getState(AudioState)
  matches(action)
    .when(AudioSettingAction.setMasterVolume.matches, (action) => {
      s.merge({ masterVolume: action.value })
      ClientStorage.set(AudioSettingKeys.AUDIO, action.value)
      Engine.instance.cameraGainNode.gain.setTargetAtTime(action.value, Engine.instance.audioContext.currentTime, 0.01)
    })
    .when(AudioSettingAction.setMicrophoneVolume.matches, (action) => {
      s.merge({ microphoneGain: action.value })
      ClientStorage.set(AudioSettingKeys.MICROPHONE, action.value)
    })
    .when(AudioSettingAction.setUsePositionalMedia.matches, (action) => {
      s.merge({ usePositionalMedia: action.value })
      ClientStorage.set(AudioSettingKeys.USE_POSITIONAL_MEDIA, action.value)
    })
    .when(AudioSettingAction.setMediaStreamVolume.matches, (action) => {
      s.merge({ mediaStreamVolume: action.value })
      ClientStorage.set(AudioSettingKeys.MEDIA_STREAM_VOLUME, action.value)
      Engine.instance.gainNodeMixBuses.mediaStreams.gain.setTargetAtTime(
        action.value,
        Engine.instance.audioContext.currentTime,
        0.01
      )
    })
    .when(AudioSettingAction.setNotificationVolume.matches, (action) => {
      s.merge({ notificationVolume: action.value })
      ClientStorage.set(AudioSettingKeys.NOTIFICATION_VOLUME, action.value)
      Engine.instance.gainNodeMixBuses.notifications.gain.setTargetAtTime(
        action.value,
        Engine.instance.audioContext.currentTime,
        0.01
      )
    })
    .when(AudioSettingAction.setSoundEffectsVolume.matches, (action) => {
      s.merge({ soundEffectsVolume: action.value })
      ClientStorage.set(AudioSettingKeys.SOUND_EFFECT_VOLUME, action.value)
      Engine.instance.gainNodeMixBuses.soundEffects.gain.setTargetAtTime(
        action.value,
        Engine.instance.audioContext.currentTime,
        0.01
      )
    })
    .when(AudioSettingAction.setMusicVolume.matches, (action) => {
      s.merge({ backgroundMusicVolume: action.value })
      ClientStorage.set(AudioSettingKeys.BACKGROUND_MUSIC_VOLUME, action.value)
      Engine.instance.gainNodeMixBuses.music.gain.setTargetAtTime(
        action.value,
        Engine.instance.audioContext.currentTime,
        0.01
      )
    })
}

export class AudioSettingAction {
  static setMasterVolume = defineAction({
    type: 'xre.audio.AudioSetting.MASTER_VOLUME' as const,
    value: matches.number
  })
  static setMicrophoneVolume = defineAction({
    type: 'xre.audio.AudioSetting.MICROPHONE_VOLUME' as const,
    value: matches.number
  })
  static setUsePositionalMedia = defineAction({
    type: 'xre.audio.AudioSetting.POSITIONAL_MEDIA' as const,
    value: matches.boolean
  })
  static setMediaStreamVolume = defineAction({
    type: 'xre.audio.AudioSetting.MEDIA_STREAM_VOLUME' as const,
    value: matches.number
  })
  static setNotificationVolume = defineAction({
    type: 'xre.audio.AudioSetting.NOTIFICATION_VOLUME' as const,
    value: matches.number
  })
  static setSoundEffectsVolume = defineAction({
    type: 'xre.audio.AudioSetting.SOUND_EFFECT_VOLUME' as const,
    value: matches.number
  })
  static setMusicVolume = defineAction({
    type: 'xre.audio.AudioSetting.BACKGROUND_MUSIC_VOLUME' as const,
    value: matches.number
  })
}
