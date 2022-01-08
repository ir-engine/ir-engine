import { EngineActions } from '../../ecs/classes/EngineService'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { dispatchLocal } from '../../networking/functions/dispatchFrom'
import { BackgroundMusic } from '../components/BackgroundMusic'
import { PlaySoundEffect } from '../components/PlaySoundEffect'
import { SoundEffect } from '../components/SoundEffect'

export default async function AudioSystem(world: World): Promise<System> {
  const soundEffectQuery = defineQuery([SoundEffect])
  const musicQuery = defineQuery([BackgroundMusic])
  const playQuery = defineQuery([SoundEffect, PlaySoundEffect])

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
    dispatchLocal(EngineActions.startSuspendedContexts() as any)
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
    callbacks = null!
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
    const sound = getComponent(ent, SoundEffect)
    const playTag = getComponent(ent, PlaySoundEffect)
    const audio = sound.audio[playTag.index]
    audio.volume = Math.min(Math.max(playTag.volume, 0), 1)
    audio.play()
    removeComponent(ent, PlaySoundEffect)
  }

  window.addEventListener('touchstart', startAudio, true)
  window.addEventListener('touchend', startAudio, true)
  window.addEventListener('click', startAudio, true)

  return () => {
    for (const entity of soundEffectQuery.enter(world)) {
      const effect = getComponent(entity, SoundEffect)
      if (!audio) {
        effect.src.forEach((src, i) => {
          if (!src) {
            return
          }

          const audio = new Audio()
          effect.audio[i] = audio
          audio.src = src
        })
      }
    }

    for (const entity of musicQuery.enter(world)) {
      whenReady(() => startBackgroundMusic(entity))
    }

    for (const entity of musicQuery.exit(world)) {
      stopBackgroundMusic(entity)
    }

    for (const entity of playQuery.enter(world)) {
      whenReady(() => playSoundEffect(entity))
    }
  }
}
