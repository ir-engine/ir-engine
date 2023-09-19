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

import { useHookstate } from '@etherealengine/hyperflux'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  BufferGeometry,
  Float32BufferAttribute,
  LinearFilter,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Texture,
  Uint16BufferAttribute
} from 'three'
import { iOS } from '../../../../common/functions/isMobile'
import { defineComponent, getMutableComponent, useComponent } from '../../../../ecs/functions/ComponentFunctions'
import { AnimationSystemGroup } from '../../../../ecs/functions/EngineFunctions'
import { useEntityContext } from '../../../../ecs/functions/EntityFunctions'
import {
  SystemDefinitions,
  SystemUUID,
  defineSystem,
  disableSystem,
  startSystem
} from '../../../../ecs/functions/SystemFunctions'
import { EngineRenderer } from '../../../../renderer/WebGLRendererSystem'
import { addObjectToGroup, removeObjectFromGroup } from '../../GroupComponent'
import { MediaElementComponent } from '../../MediaComponent'
import { ManifestSchema, MessageType, PayLoad, WorkerMessage } from './interfaces'

export const UVOL1Component = defineComponent({
  name: 'UVOL1Component',

  onInit: (entity) => {
    return {
      track: {
        manifestPath: '',
        data: {} as ManifestSchema
      },
      playing: false,
      paused: false,
      ended: false,

      /**
       * This is set to false when UVOL2 (or others) is being used.
       * When this is true, A system is started to fetch and decode frames.
       * When this is false, the system is disabled.
       */
      active: false,

      /**
       * When video is unable to play due to autoplay policy, this is set to true.
       * VolumetricComponent manages event listeners, to play it when user interacts with the scene.
       */
      handleAutoplay: false
    }
  },

  reactor: UVOL1Reactor
})

export function UVOL1Reactor() {
  const entity = useEntityContext()
  const component = useComponent(entity, UVOL1Component)
  const systemUUID = useMemo(() => MathUtils.generateUUID() as SystemUUID, [])

  const worker = useMemo(() => {
    // @ts-ignore
    const workerURL = new URL('./CortoWorker.bundle.js', import.meta.url)
    const _worker = new Worker(workerURL, { type: 'module' })
    _worker.onerror = console.error
    _worker.onmessage = ({ data }: { data: WorkerMessage }) => {
      switch (data.type) {
        case MessageType.INITIALIZED:
          isWorkerReady.current = true
          break
        case MessageType.FRAMEDATA:
          if (data.payload) {
            workerPendingRequests.current -= 1
            handleFrameData(data.payload)
          }
          break
      }
    }
    return _worker
  }, [])

  const meshBuffer = useMemo(() => new Map<number, BufferGeometry>(), [])
  const targetFramesToRequest = useMemo(() => (iOS ? 10 : 90), [])

  const videoTexture = useMemo(() => {
    const videoElement = getMutableComponent(entity, MediaElementComponent).value
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

  const defaultGeometry = useMemo(() => new PlaneGeometry(0.1, 0.1) as BufferGeometry, [])
  const mesh = useMemo(() => new Mesh(defaultGeometry, material), [])

  const mediaElement = getMutableComponent(entity, MediaElementComponent).value
  const video = mediaElement.element as HTMLVideoElement

  const workerPendingRequests = useRef(0)
  const isWorkerReady = useRef(false)
  const nextFrameToRequest = useRef(0)
  const rVFCHandle = useRef(-1)

  const initialBuffersLoaded = useHookstate(false)

  useEffect(() => {
    if (component.active.value) {
      // Starting a new track
      addObjectToGroup(entity, mesh)
      resetWorker()
      workerPendingRequests.current = 0
      nextFrameToRequest.current = 0
      rVFCHandle.current = video.requestVideoFrameCallback(handleVideoFrame)
      video.src = component.track.manifestPath.value.replace('.manifest', '.mp4')
      component.paused.set(false)
      component.ended.set(false)
      video.addEventListener('ended', onTrackEnd)
      component.playing.set(true)
      initialBuffersLoaded.set(false)
    }
  }, [component.track, component.active])

  useEffect(() => {
    if (component.paused.value) {
      video.pause()
    } else if (initialBuffersLoaded.value) {
      video.play()
    }
  }, [component.paused])

  const handleVideoFrame = useCallback(
    (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => {
      video.requestVideoFrameCallback(handleVideoFrame)
      const frameToPlay = Math.round(metadata.mediaTime * component.track.data.value.frameRate)
      processFrame(frameToPlay)
    },
    [component.track.data]
  )

  const bufferLoop = useCallback(() => {
    if (component.ended.value) return

    const numberOfFrames = component.track.data.value.frameData.length
    if (nextFrameToRequest.current === numberOfFrames - 1) {
      // Fetched all frames
      return
    }

    const minimumBufferLength = targetFramesToRequest * 2
    const meshBufferHasEnoughToPlay = meshBuffer.size >= minimumBufferLength * 3
    const meshBufferHasEnough = meshBuffer.size >= minimumBufferLength * 5

    if (workerPendingRequests.current < 3 && isWorkerReady && !meshBufferHasEnough) {
      const newLastFrame = Math.min(nextFrameToRequest.current + targetFramesToRequest - 1, numberOfFrames - 1)

      const payload = {
        frameStart: nextFrameToRequest.current,
        frameEnd: newLastFrame
      }
      const message: WorkerMessage = {
        type: MessageType.REQUEST,
        payload
      }

      if (worker !== null) {
        // worker is always not null at this point
        worker.postMessage(message)
      }
      workerPendingRequests.current++

      nextFrameToRequest.current = newLastFrame
    }

    if (meshBufferHasEnoughToPlay && !component.paused.value && video.paused) {
      initialBuffersLoaded.set(true)
      video.play().catch((e) => {
        component.handleAutoplay.set(true)
      })
    }
  }, [component.paused, component.ended, component.track.data])

  /**
   * sync mesh frame to video texture frame
   */
  const processFrame = useCallback((frameToPlay: number) => {
    if (meshBuffer.has(frameToPlay)) {
      // @ts-ignore: value cannot be anything else other than BufferGeometry
      mesh.geometry = meshBuffer.get(frameToPlay)
      mesh.geometry.attributes.position.needsUpdate = true

      videoTexture.needsUpdate = true
      EngineRenderer.instance.renderer.initTexture(videoTexture)
    }
    removePlayedBuffer(frameToPlay)
  }, [])

  const handleFrameData = useCallback((messages: PayLoad[]) => {
    for (const frameData of messages) {
      const geometry = new BufferGeometry()
      geometry.setIndex(new Uint16BufferAttribute(frameData.bufferGeometry.index.buffer, 1))
      geometry.setAttribute('position', new Float32BufferAttribute(frameData.bufferGeometry.position.buffer, 3))
      geometry.setAttribute('uv', new Float32BufferAttribute(frameData.bufferGeometry.uv.buffer, 2))

      meshBuffer.set(frameData.keyframeNumber, geometry)
    }
  }, [])

  const resetWorker = useCallback(() => {
    const track = component.track.get({ noproxy: true })
    const meshFilePath = track.manifestPath.replace('.manifest', '.drcs')
    const manifestData = track.data
    const message: WorkerMessage = {
      type: MessageType.INITIALIZE,
      payload: {
        meshFilePath,
        fileHeader: manifestData
      }
    }
    console.log("DEBUG: worker's INITIALIZE message: ", message)
    worker.postMessage(message)
  }, [component.track])

  useEffect(() => {
    const handle = SystemDefinitions.has(systemUUID)
      ? systemUUID
      : defineSystem({ uuid: systemUUID, execute: bufferLoop })
    if (component.active.value) {
      startSystem(handle, {
        with: AnimationSystemGroup
      })
    } else {
      disableSystem(handle)
    }
  }, [component.active])

  const removePlayedBuffer = useCallback((currentFrame: number) => {
    for (const [key, buffer] of meshBuffer.entries()) {
      if (key < currentFrame) {
        buffer.dispose()
        meshBuffer.delete(key)
      }
    }
  }, [])

  const onTrackEnd = useCallback(() => {
    console.log('DEBUG: ', 'at onTrackEnd')
    mesh.geometry = defaultGeometry
    removeObjectFromGroup(entity, mesh)
    component.ended.set(true)
    const numberOfFrames = component.track.data.value.frameData.length
    removePlayedBuffer(numberOfFrames)
    video.cancelVideoFrameCallback(rVFCHandle.current)
    video.removeEventListener('ended', onTrackEnd)
    video.src = ''
    component.playing.set(false)
  }, [component.track.data])

  useEffect(() => {
    return () => {
      disableSystem(systemUUID)
      // Cleanup
      worker.terminate()
      videoTexture.dispose()
      for (let i = 0; i < meshBuffer.size; i++) {
        const buffer = meshBuffer.get(i)
        if (buffer && buffer instanceof BufferGeometry) {
          buffer.dispose()
        }
      }
      meshBuffer.clear()
    }
  }, [])

  return null
}
