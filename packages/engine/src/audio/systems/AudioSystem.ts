import { Not } from 'bitecs'
import { DoubleSide, Mesh, MeshBasicMaterial, PlaneBufferGeometry } from 'three'

import { addActionReceptor, createActionQueue, dispatchAction } from '@xrengine/hyperflux'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { Engine } from '../../ecs/classes/Engine'
import { EngineActions } from '../../ecs/classes/EngineState'
import { World } from '../../ecs/classes/World'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { matchActionOnce } from '../../networking/functions/matchActionOnce'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { VideoComponent } from '../../scene/components/VideoComponent'
import { VolumetricComponent } from '../../scene/components/VolumetricComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { updateAudio } from '../../scene/functions/loaders/AudioFunctions'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { AudioSettingReceptor, restoreAudioSettings } from '../AudioState'
import { AudioComponent } from '../components/AudioComponent'

const AUDIO_TEXTURE_PATH = '/static/editor/audio-icon.png' // Static

export default async function AudioSystem(world: World) {
  const audioTexture = await AssetLoader.loadAsync(AUDIO_TEXTURE_PATH)

  let audioReady = false
  let callbacks: any[] = []
  let audio: any

  const whenReady = (cb): void => {
    if (audioReady) {
      cb()
    } else {
      callbacks.push(cb)
    }
  }

  const startAudio = (e) => {
    window.removeEventListener('pointerdown', startAudio, true)
    console.log('starting audio')
    audioReady = true
    Engine.instance.currentWorld.audioListener.context.resume()
    dispatchAction(EngineActions.startSuspendedContexts({}))

    callbacks.forEach((cb) => cb())
    callbacks = null!
  }
  window.addEventListener('pointerdown', startAudio, true)

  matchActionOnce(EngineActions.joinedWorld.matches, () => {
    restoreAudioSettings()
  })

  addActionReceptor(AudioSettingReceptor)

  const modifyPropertyActionQuue = createActionQueue(EngineActions.sceneObjectUpdate.matches)

  const audioStereoQuery = defineQuery([AudioComponent, Not(VideoComponent), Not(VolumetricComponent)])
  const videoQuery = defineQuery([AudioComponent, VideoComponent, Not(VolumetricComponent)])
  const volumetricQuery = defineQuery([AudioComponent, Not(VideoComponent), VolumetricComponent])

  return () => {
    for (const entity of audioStereoQuery.enter()) {
      if (Engine.instance.isEditor) {
        const obj3d = getComponent(entity, Object3DComponent).value

        obj3d.userData.textureMesh = new Mesh(
          new PlaneBufferGeometry(),
          new MeshBasicMaterial({ transparent: true, side: DoubleSide })
        )
        obj3d.add(obj3d.userData.textureMesh)
        obj3d.userData.textureMesh.userData.disableOutline = true
        obj3d.userData.textureMesh.userData.isHelper = true
        setObjectLayers(obj3d.userData.textureMesh, ObjectLayers.NodeHelper)

        obj3d.userData.textureMesh.material.map = audioTexture
      }
      updateAudio(entity)
    }

    for (const entity of audioStereoQuery.exit()) {
      const obj3d = getComponent(entity, Object3DComponent).value
      if (Engine.instance.isEditor) {
        obj3d.remove(obj3d.userData.textureMesh)
        obj3d.userData.textureMesh = undefined
      }
      obj3d.remove(obj3d.userData.audioEl)
      obj3d.userData.audioEl = undefined
    }

    for (const action of modifyPropertyActionQuue())
      for (const entity of action.entities) if (audioStereoQuery().includes(entity)) updateAudio(entity)
  }
}
