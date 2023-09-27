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
import { getState } from '@etherealengine/hyperflux'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, LinearFilter, Mesh, MeshBasicMaterial, PlaneGeometry, Texture } from 'three'
import { CORTOLoader } from '../../assets/loaders/corto/CORTOLoader'
import { AudioState } from '../../audio/AudioState'
import { iOS } from '../../common/functions/isMobile'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { defineComponent, getMutableComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { AnimationSystemGroup } from '../../ecs/functions/EngineFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { addObjectToGroup, removeObjectFromGroup } from './GroupComponent'
import { MediaElementComponent } from './MediaComponent'
import { VolumetricComponent, handleAutoplay } from './VolumetricComponent'

const decodeCorto = (url: string, start: number, end: number) => {
  return new Promise<BufferGeometry | null>((res, rej) => {
    Engine.instance.cortoLoader.load(url, start, end, (geometry) => {
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
      data: {} as ManifestSchema
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
    texture.colorSpace = EngineRenderer.instance.renderer.outputColorSpace
    return texture
  }, [])

  const material = useMemo(() => {
    const _material = new MeshBasicMaterial({ color: 0xffffff })
    _material.map = videoTexture
    return _material
  }, [])

  const defaultGeometry = useMemo(() => new PlaneGeometry(0.001, 0.001) as BufferGeometry, [])
  const mesh = useMemo(() => new Mesh(defaultGeometry, material), [])

  const pendingRequests = useRef(0)
  const nextFrameToRequest = useRef(0)

  useEffect(() => {
    if (!Engine.instance.cortoLoader) {
      const loader = new CORTOLoader()
      loader.setDecoderPath(getState(EngineState).publicPath + '/loader_decoders/')
      loader.preload()
      Engine.instance.cortoLoader = loader
    }
    addObjectToGroup(entity, mesh)
    video.src = component.manifestPath.value.replace('.manifest', '.mp4')

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
    if (volumetric.paused.value || !volumetric.initialBuffersLoaded.value) {
      video.pause()
      return
    }

    video.play().catch((e) => {
      if (e.name === 'NotAllowedError') {
        handleAutoplay(audioContext, video)
      } else {
        console.error(e)
      }
    })
  }, [volumetric.paused, volumetric.initialBuffersLoaded])

  /**
   * sync mesh frame to video texture frame
   */
  const processFrame = (frameToPlay: number) => {
    if (meshBuffer.has(frameToPlay)) {
      // @ts-ignore: value cannot be anything else other than BufferGeometry
      mesh.geometry = meshBuffer.get(frameToPlay)
      mesh.geometry.attributes.position.needsUpdate = true

      videoTexture.needsUpdate = true
      EngineRenderer.instance.renderer.initTexture(videoTexture)
    } else {
      console.log(`VDEBUG Entity ${entity} wants to play ${frameToPlay}, but not available yet`)
    }
    removePlayedBuffer(frameToPlay)
  }

  const handleVideoFrame = (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {
    const frameToPlay = Math.round(metadata.mediaTime * component.data.value.frameRate)
    processFrame(frameToPlay)
  }

  useVideoFrameCallback(video, handleVideoFrame)

  const bufferLoop = () => {
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
        console.log(`VDEBUG Entity ${entity} requesting frame ${i}`)
        decodeCorto(meshFilePath, byteStart, byteEnd)
          .then((geometry) => {
            if (!geometry) {
              throw new Error('VDEBUG Entity ${entity} Invalid geometry frame: ' + i.toString())
            }

            meshBuffer.set(i, geometry)
            pendingRequests.current -= 1
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
  }

  useExecute(bufferLoop, {
    with: AnimationSystemGroup
  })

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
