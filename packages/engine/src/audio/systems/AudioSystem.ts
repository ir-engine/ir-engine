import { SoundEffect } from '../components/SoundEffect'
import { BackgroundMusic } from '../components/BackgroundMusic'
import { PlaySoundEffect } from '../components/PlaySoundEffect'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { defineQuery, defineSystem, enterQuery, exitQuery, System } from '../../ecs/bitecs'
import { ECSWorld } from '../../ecs/classes/World'
import { EngineEvents } from '../../ecs/classes/EngineEvents'

export const AudioSystem = async (): Promise<System> => {
  const soundEffectQuery = defineQuery([SoundEffect])
  const soundEffectAddQuery = enterQuery(soundEffectQuery)

  const musicQuery = defineQuery([BackgroundMusic])
  const musicAddQuery = enterQuery(musicQuery)
  const musicRemoveQuery = exitQuery(musicQuery)

  const playQuery = defineQuery([SoundEffect, PlaySoundEffect])
  const playAddQuery = enterQuery(playQuery)

  /** Indicates whether the system is ready or not. */
  let audioReady = false
  /** Callbacks to be called after system is ready. */
  let callbacks: any[] = []
  /** Audio Element. */
  let audio: any
  /** Audio Context. */
  let context: AudioContext

  /**
   * Call the callbacks when system is ready or push callbacks in array otherwise.
   * @param cb Callback to be called when system is ready.
   */
  const whenReady = (cb): void => {
    if (audioReady) {
      cb()
    } else {
      callbacks.push(cb)
    }
  }

  /** Enable and start audio system. */
  const startAudio = (): void => {
    if (audioReady) return
    console.log('starting audio')
    audioReady = true
    EngineEvents.instance.dispatchEvent({
      type: EngineEvents.EVENTS.START_SUSPENDED_CONTEXTS
    })
    window.AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (window.AudioContext) {
      context = new window.AudioContext()
      // Create empty buffer
      const buffer = context.createBuffer(1, 1, 22050)
      const source = context.createBufferSource()
      source.buffer = buffer
      // Connect to output (speakers)
      source.connect(context.destination)
      // Play sound
      if (source.start) {
        source.start(0)
      } else if ((source as any).play) {
        ;(source as any).play(0)
      }
    }

    callbacks.forEach((cb) => cb())
    callbacks = null
  }

  /**
   * Start Background music if available.
   * @param ent Entity to get the {@link audio/components/BackgroundMusic.BackgroundMusic | BackgroundMusic} Component.
   */
  const startBackgroundMusic = (ent): void => {
    const music = ent.getComponent(BackgroundMusic)
    if (music.src && !audio) {
      music.audio = new Audio()
      music.audio.loop = true
      music.audio.volume = music.volume
      music.audio.addEventListener('loadeddata', () => {
        music.audio.play()
      })
      music.audio.src = music.src
    }
  }

  /**
   * Stop Background Music.
   * @param ent Entity to get the {@link audio/components/BackgroundMusic.BackgroundMusic | BackgroundMusic} Component.
   */
  const stopBackgroundMusic = (ent): void => {
    const music = ent.getComponent(BackgroundMusic)
    if (music && music.audio) {
      music.audio.pause()
    }
  }

  /**
   * Play sound effect.
   * @param ent Entity to get the {@link audio/components/PlaySoundEffect.PlaySoundEffect | PlaySoundEffect} Component.
   */
  const playSoundEffect = (ent): void => {
    const sound = ent.getComponent(SoundEffect)
    sound.audio.play()
    ent.removeComponent(PlaySoundEffect)
  }

  window.addEventListener('touchstart', startAudio, true)
  window.addEventListener('touchend', startAudio, true)
  window.addEventListener('click', startAudio, true)

  return defineSystem((world: ECSWorld) => {
    for (const entity of soundEffectAddQuery(world)) {
      const effect = getComponent(entity, SoundEffect)
      if (effect.src && !audio) {
        effect.audio = new Audio()
        effect.audio.addEventListener('loadeddata', () => {
          effect.audio.volume = effect.volume
        })
        effect.audio.src = effect.src
      }
    }

    for (const entity of musicAddQuery(world)) {
      whenReady(() => startBackgroundMusic(entity))
    }

    for (const entity of musicRemoveQuery(world)) {
      stopBackgroundMusic(entity)
    }

    for (const entity of playAddQuery(world)) {
      whenReady(() => playSoundEffect(entity))
    }

    return world
  })
}
