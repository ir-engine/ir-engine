/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { useVideoFrameCallback } from '@etherealengine/common/src/utils/useVideoFrameCallback'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { useEffect, useMemo, useRef } from 'react'
import {
  BufferGeometry,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  ShaderMaterial,
  Texture
} from 'three'
import { CORTOLoader } from '../../assets/loaders/corto/CORTOLoader'
import { AssetLoaderState } from '../../assets/state/AssetLoaderState'
import { AudioState } from '../../audio/AudioState'
import { iOS } from '../../common/functions/isMobile'
import { EngineState } from '../../ecs/classes/EngineState'
import {
  defineComponent,
  getMutableComponent,
  hasComponent,
  removeComponent,
  setComponent,
  useComponent
} from '../../ecs/functions/ComponentFunctions'
import { AnimationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MediaElementComponent } from './MediaComponent'
import { ShadowComponent } from './ShadowComponent'
import { UVOLDissolveComponent } from './UVOLDissolveComponent'
import { VolumetricComponent, handleAutoplay } from './VolumetricComponent'

const decodeCorto = (url: string, start: number, end: number) => {
  return new Promise<BufferGeometry | null>((res, rej) => {
    getState(AssetLoaderState).cortoLoader.load(url, start, end, (geometry) => {
      res(geometry)
    })
  })
}

interface FrameData {
  frameNumber: number
  keyframeNumber: number
  startBytePosition: number
  vertices: number
  faces: number
  meshLength: number
}

interface ManifestSchema {
  maxVertices: number
  maxTriangles: number
  frameData: FrameData[]
  frameRate: number
}

export const UVOL1Component = defineComponent({
  name: 'UVOL1Component',

  onInit: (entity) => {
    return {
      manifestPath: '',
      data: {} as ManifestSchema,
      firstGeometryFrameLoaded: false,
      loadingEffectStarted: false,
      loadingEffectEnded: false
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.manifestPath) {
      component.manifestPath.set(json.manifestPath)
    }
    if (json.data) {
      component.data.set(json.data)
    }
  },

  reactor: UVOL1Reactor
})

function UVOL1Reactor() {
  const entity = useEntityContext()
  const volumetric = useComponent(entity, VolumetricComponent)
  const component = useComponent(entity, UVOL1Component)
  const videoElement = getMutableComponent(entity, MediaElementComponent).value
  const audioContext = getState(AudioState).audioContext
  const video = videoElement.element as HTMLVideoElement

  const meshBuffer = useMemo(() => new Map<number, BufferGeometry>(), [])
  const targetFramesToRequest = iOS ? 10 : 90

  const videoTexture = useMemo(() => {
    const element = videoElement.element as HTMLVideoElement
    const texture = new Texture(element)
    texture.generateMipmaps = false
    texture.minFilter = LinearFilter
    texture.magFilter = LinearFilter
    ;(texture as any).isVideoTexture = true
    ;(texture as any).update = () => {}
    texture.colorSpace = SRGBColorSpace
    return texture
  }, [])

  const material = useMemo(() => {
    const _material = new MeshBasicMaterial({ color: 0xffffff })
    _material.map = videoTexture
    return _material
  }, [])

  const defaultGeometry = useMemo(() => new PlaneGeometry(0.001, 0.001) as BufferGeometry, [])

  // @ts-ignore
  const mesh: Mesh<BufferGeometry, ShaderMaterial | MeshBasicMaterial> = useMemo(
    () => new Mesh(defaultGeometry, material),
    []
  )

  const pendingRequests = useRef(0)
  const nextFrameToRequest = useRef(0)

  useEffect(() => {
    if (!getState(AssetLoaderState).cortoLoader) {
      const loader = new CORTOLoader()
      loader.setDecoderPath(getState(EngineState).publicPath + '/loader_decoders/')
      loader.preload()
      const assetLoaderState = getMutableState(AssetLoaderState)
      assetLoaderState.cortoLoader.set(loader)
    }
    if (volumetric.useLoadingEffect.value) {
      setComponent(entity, UVOLDissolveComponent)
    }
    const shadow = getMutableComponent(entity, ShadowComponent)
    shadow.cast.set(true)
    shadow.receive.set(true)

    video.src = component.manifestPath.value.replace('.manifest', '.mp4')
    video.load()
    video.addEventListener('ended', function setEnded() {
      volumetric.ended.set(true)
      video.removeEventListener('ended', setEnded)
    })

    return () => {
      removeObjectFromGroup(entity, mesh)
      videoTexture.dispose()
      const numberOfFrames = component.data.value.frameData.length
      removePlayedBuffer(numberOfFrames)
      meshBuffer.clear()
      video.src = ''
    }
  }, [])

  useEffect(() => {
    if (component.loadingEffectStarted.value && !component.loadingEffectEnded.value) {
      // Loading effect in progress. Let it finish
      return
    }
    // If autoplay is enabled, play the video irrespective of paused state
    if (volumetric.autoplay.value && volumetric.initialBuffersLoaded.value) {
      handleAutoplay(audioContext, video, volumetric)
    }
  }, [volumetric.autoplay, volumetric.initialBuffersLoaded, component.loadingEffectEnded])

  useEffect(() => {
    if (volumetric.paused.value || !volumetric.initialBuffersLoaded.value) {
      video.pause()
      return
    }
    if (mesh.material !== material) {
      mesh.material = material
      mesh.material.needsUpdate = true
    }
    handleAutoplay(audioContext, video, volumetric)
  }, [volumetric.paused])

  useEffect(() => {
    if (!component.firstGeometryFrameLoaded.value) return
    let timer = -1

    const prepareMesh = () => {
      if (video.buffered.length === 0) {
        // Video is not loaded yet,
        // wait for a bit and try again
        clearTimeout(timer)
        timer = window.setTimeout(prepareMesh, 200)
        return
      }

      mesh.geometry = meshBuffer.get(0)!
      mesh.geometry.attributes.position.needsUpdate = true

      videoTexture.needsUpdate = true
      EngineRenderer.instance.renderer.initTexture(videoTexture)

      if (volumetric.useLoadingEffect.value) {
        mesh.material = UVOLDissolveComponent.createDissolveMaterial(mesh)
        mesh.material.needsUpdate = true
        component.loadingEffectStarted.set(true)
      }

      addObjectToGroup(entity, mesh)
    }

    prepareMesh()
  }, [component.firstGeometryFrameLoaded])

  useVideoFrameCallback(video, (now, metadata) => {
    if (!metadata) return
    /**
     * sync mesh frame to video texture frame
     */
    const processFrame = (frameToPlay: number) => {
      if (mesh.material instanceof ShaderMaterial && !hasComponent(entity, UVOLDissolveComponent)) {
        const oldMaterial = mesh.material
        mesh.material = material
        mesh.material.needsUpdate = true
        oldMaterial.dispose()
      }

      if (meshBuffer.has(frameToPlay)) {
        // @ts-ignore: value cannot be anything else other than BufferGeometry
        mesh.geometry = meshBuffer.get(frameToPlay)
        mesh.geometry.attributes.position.needsUpdate = true

        videoTexture.needsUpdate = true
        EngineRenderer.instance.renderer.initTexture(videoTexture)
      }
      removePlayedBuffer(frameToPlay)
    }

    const frameToPlay = Math.round(metadata.mediaTime * component.data.value.frameRate)
    processFrame(frameToPlay)
  })

  useExecute(
    () => {
      const delta = getState(EngineState).deltaSeconds

      if (
        component.loadingEffectStarted.value &&
        !component.loadingEffectEnded.value &&
        // @ts-ignore
        UVOLDissolveComponent.updateDissolveEffect(entity, mesh, delta)
      ) {
        removeComponent(entity, UVOLDissolveComponent)
        mesh.material = material
        mesh.material.needsUpdate = true
        component.loadingEffectEnded.set(true)
        return
      }

      const numberOfFrames = component.data.value.frameData.length
      if (nextFrameToRequest.current === numberOfFrames - 1) {
        // Fetched all frames
        return
      }

      const minimumBufferLength = targetFramesToRequest * 2
      const meshBufferHasEnoughToPlay = meshBuffer.size >= Math.max(targetFramesToRequest * 2, 90) // 2 seconds
      const meshBufferHasEnough = meshBuffer.size >= minimumBufferLength * 5

      if (pendingRequests.current == 0 && !meshBufferHasEnough) {
        const newLastFrame = Math.min(nextFrameToRequest.current + targetFramesToRequest - 1, numberOfFrames - 1)
        for (let i = nextFrameToRequest.current; i <= newLastFrame; i++) {
          const meshFilePath = component.manifestPath.value.replace('.manifest', '.drcs')
          const byteStart = component.data.value.frameData[i].startBytePosition
          const byteEnd = byteStart + component.data.value.frameData[i].meshLength
          pendingRequests.current += 1
          decodeCorto(meshFilePath, byteStart, byteEnd)
            .then((geometry) => {
              if (!geometry) {
                throw new Error('VDEBUG Entity ${entity} Invalid geometry frame: ' + i.toString())
              }

              meshBuffer.set(i, geometry)
              pendingRequests.current -= 1

              if (i === 0) {
                component.firstGeometryFrameLoaded.set(true)
              }
            })
            .catch((e) => {
              console.error('Error decoding corto frame: ', i, e)
              pendingRequests.current -= 1
            })

          nextFrameToRequest.current = newLastFrame
        }

        if (meshBufferHasEnoughToPlay && !volumetric.initialBuffersLoaded.value) {
          volumetric.initialBuffersLoaded.set(true)
        }
      }
    },
    {
      with: AnimationSystemGroup
    }
  )

  const removePlayedBuffer = (currentFrame: number) => {
    for (const [key, buffer] of meshBuffer.entries()) {
      if (key < currentFrame) {
        buffer.dispose()
        meshBuffer.delete(key)
      }
    }
  }

  return null
}
