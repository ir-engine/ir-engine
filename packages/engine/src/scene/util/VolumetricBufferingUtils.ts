/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { State } from '@ir-engine/hyperflux'
import { isMobile } from '@ir-engine/spatial/src/common/functions/isMobile'
import { isMobileXRHeadset } from '@ir-engine/spatial/src/xr/XRState'
import { MutableRefObject } from 'react'
import {
  BufferGeometry,
  CompressedTexture,
  InterleavedBufferAttribute,
  Material,
  Mesh,
  MeshStandardMaterial,
  ShaderMaterial,
  Vector2
} from 'three'
import {
  DRACOTarget,
  GeometryType,
  KeyframeAttribute,
  PlayerManifest as ManifestSchema,
  OldManifestSchema,
  TIME_UNIT_MULTIPLIER,
  TextureFormat,
  TextureTarget,
  TextureType,
  UniformSolveTarget
} from '../constants/NewUVOLTypes'
import BufferDataContainer from './BufferDataContainer'
import { getResourceURL, loadDraco, loadGLTF, loadKTX2, rateLimitedCortoLoader } from './VolumetricUtils'

type ResolvedType<T> = T extends Promise<infer R> ? R : never
type DracoResponse = ResolvedType<ReturnType<typeof loadDraco>>
type GLTFResponse = ResolvedType<ReturnType<typeof loadGLTF>>

export const bufferLimits = {
  geometry: {
    [GeometryType.Corto]: {
      desktopMaxBufferDuration: 36, // seconds
      mobileMaxBufferDuration: 15,
      initialBufferDuration: 7,
      minBufferDurationToPlay: 4
    },
    [GeometryType.Draco]: {
      desktopMaxBufferDuration: 4,
      mobileMaxBufferDuration: 3,
      initialBufferDuration: 3,
      minBufferDurationToPlay: 2
    },
    [GeometryType.Unify]: {
      desktopMaxBufferDuration: 10,
      mobileMaxBufferDuration: 5,
      initialBufferDuration: 3,
      minBufferDurationToPlay: 0.75
    }
  },
  texture: {
    ['ktx2' as TextureFormat]: {
      desktopMaxBufferDuration: 8, // seconds
      mobileMaxBufferDuration: 3,
      initialBufferDuration: 3,
      minBufferDurationToPlay: 0.75
    },
    ['astc/ktx2' as TextureFormat]: {
      desktopMaxBufferDuration: 6, // seconds
      mobileMaxBufferDuration: 3,
      initialBufferDuration: 3,
      minBufferDurationToPlay: 0.75
    }
  }
}

interface fetchProps {
  manifest: OldManifestSchema | ManifestSchema | Record<string, never>
  manifestPath: string
  currentTimeInMS: number
  bufferData: BufferDataContainer
  target: string
  startTimeInMS: number
}

interface fetchGeometryProps extends fetchProps {
  geometryType: GeometryType
  geometryBuffer: Map<string, (Mesh<BufferGeometry, Material> | BufferGeometry | KeyframeAttribute)[]>
  mesh: Mesh<BufferGeometry, ShaderMaterial>
  initialBufferLoaded: State<boolean>
  repeat: MutableRefObject<Vector2>
  offset: MutableRefObject<Vector2>
}

export const fetchGeometry = ({
  currentTimeInMS,
  bufferData,
  target,
  manifest,
  geometryType,
  manifestPath,
  geometryBuffer,
  mesh,
  initialBufferLoaded,
  startTimeInMS,
  repeat,
  offset
}: fetchGeometryProps) => {
  if (Object.keys(manifest).length === 0) return
  const currentTime = currentTimeInMS * (TIME_UNIT_MULTIPLIER / 1000)
  const nextMissing = bufferData.getNextMissing(currentTime)

  const frameRate =
    geometryType === GeometryType.Corto
      ? (manifest as OldManifestSchema).frameRate
      : (manifest as ManifestSchema).geometry.targets[target].frameRate
  const frameCount =
    geometryType === GeometryType.Corto
      ? (manifest as OldManifestSchema).frameData.length
      : (manifest as ManifestSchema).geometry.targets[target].frameCount!

  const duration = geometryType === GeometryType.Corto ? frameCount / frameRate : (manifest as ManifestSchema).duration

  const startFrame = Math.floor((nextMissing * frameRate) / TIME_UNIT_MULTIPLIER)
  const maxBufferDuration = Math.max(
    0,
    Math.min(
      isMobile || isMobileXRHeadset
        ? bufferLimits.geometry[geometryType].mobileMaxBufferDuration
        : bufferLimits.geometry[geometryType].desktopMaxBufferDuration,
      duration - currentTimeInMS / 1000
    )
  )

  if (startFrame >= frameCount || nextMissing - currentTime >= maxBufferDuration * TIME_UNIT_MULTIPLIER) {
    return
  }

  const endFrame = Math.min(
    frameCount - 1,
    Math.floor(((currentTime + maxBufferDuration * TIME_UNIT_MULTIPLIER) * frameRate) / TIME_UNIT_MULTIPLIER)
  )

  if (endFrame < startFrame) return

  // console.log('fetchGeometry: ', {
  //   currentTime: currentTimeInMS / 1000,
  //   startFrame,
  //   nextMissing: nextMissing / TIME_UNIT_MULTIPLIER,
  //   geometryType,
  //   frameCount,
  //   endFrame,
  //   bufferData
  // })

  if (!geometryBuffer.has(target)) {
    geometryBuffer.set(target, [])
  }
  const collection = geometryBuffer.get(target)!

  for (let currentFrame = startFrame; currentFrame <= endFrame; ) {
    const _currentFrame = currentFrame

    if (geometryType === GeometryType.Corto) {
      const currentFrameStartTime = (_currentFrame * TIME_UNIT_MULTIPLIER) / frameRate
      const currentFrameEndTime = ((_currentFrame + 1) * TIME_UNIT_MULTIPLIER) / frameRate

      const currentFrameBufferData = bufferData.getIntersectionDuration(currentFrameStartTime, currentFrameEndTime)
      if (currentFrameBufferData.missingDuration === 0) {
        currentFrame++
        continue
      }

      bufferData.addPendingRange(currentFrameStartTime, currentFrameEndTime)
      const resourceURL = getResourceURL({
        type: 'geometry',
        geometryType: GeometryType.Corto,
        manifestPath: manifestPath
      })
      const byteStart = (manifest as OldManifestSchema).frameData[_currentFrame].startBytePosition
      const byteEnd = byteStart + (manifest as OldManifestSchema).frameData[_currentFrame].meshLength

      rateLimitedCortoLoader(resourceURL, byteStart, byteEnd)
        .then((currentFrameData) => {
          const geometry = currentFrameData.geometry
          collection[_currentFrame] = geometry
          bufferData.addBufferedRange(currentFrameStartTime, currentFrameEndTime, -1)

          if (!initialBufferLoaded.value) {
            const startTime = (startTimeInMS * TIME_UNIT_MULTIPLIER) / 1000
            const endTime = startTime + bufferLimits.geometry[geometryType].initialBufferDuration * TIME_UNIT_MULTIPLIER

            const startFrameBufferData = bufferData.getIntersectionDuration(startTime, endTime)
            if (startFrameBufferData.missingDuration === 0 && startFrameBufferData.pendingDuration === 0) {
              initialBufferLoaded.set(true)
            }
          }
        })
        .catch((err) => {
          console.warn('Error in loading corto frame: ', err)
        })
      currentFrame++
    } else if (geometryType === GeometryType.Draco) {
      const currentFrameStartTime = (_currentFrame * TIME_UNIT_MULTIPLIER) / frameRate
      const currentFrameEndTime = ((_currentFrame + 1) * TIME_UNIT_MULTIPLIER) / frameRate

      const currentFrameBufferData = bufferData.getIntersectionDuration(currentFrameStartTime, currentFrameEndTime)
      if (currentFrameBufferData.missingDuration === 0) {
        currentFrame++
        continue
      }

      bufferData.addPendingRange(currentFrameStartTime, currentFrameEndTime)
      const resourceURL = getResourceURL({
        type: 'geometry',
        geometryType: geometryType,
        manifestPath: manifestPath,
        target: target,
        index: currentFrame,
        path: (manifest as ManifestSchema).geometry.path,
        format: (manifest as ManifestSchema).geometry.targets[target].format
      })

      const loadingFunction = geometryType === GeometryType.Draco ? loadDraco : loadGLTF
      loadingFunction(resourceURL)
        .then((currentFrameData: DracoResponse | GLTFResponse) => {
          const geometry =
            geometryType === GeometryType.Draco
              ? (currentFrameData as DracoResponse).geometry
              : (currentFrameData as GLTFResponse).mesh
          collection[currentFrame] = geometry
          bufferData.addBufferedRange(currentFrameStartTime, currentFrameEndTime, -1)

          if (!initialBufferLoaded.value) {
            const startTime = (startTimeInMS * TIME_UNIT_MULTIPLIER) / 1000
            const endTime = startTime + bufferLimits.geometry[geometryType].initialBufferDuration * TIME_UNIT_MULTIPLIER

            const startFrameBufferData = bufferData.getIntersectionDuration(startTime, endTime)
            if (startFrameBufferData.missingDuration === 0 && startFrameBufferData.pendingDuration === 0) {
              initialBufferLoaded.set(true)
            }
          }
        })
        .catch((err) => {
          console.warn('Error in loading draco frame: ', err)
        })
      currentFrame++
    } else if (geometryType === GeometryType.Unify) {
      const targetData = (manifest as ManifestSchema).geometry.targets[target] as UniformSolveTarget
      const segmentFrameCount = targetData.segmentFrameCount!
      const segmentIndex = Math.floor(_currentFrame / segmentFrameCount)
      const segmentOffset = segmentIndex * segmentFrameCount

      const currentSegmentStartTime = segmentIndex * targetData.settings.segmentSize * TIME_UNIT_MULTIPLIER
      const currentSegmentEndTime = (segmentIndex + 1) * targetData.settings.segmentSize * TIME_UNIT_MULTIPLIER

      const currentFrameBufferData = bufferData.getIntersectionDuration(currentSegmentStartTime, currentSegmentEndTime)
      if (currentFrameBufferData.missingDuration === 0) {
        currentFrame += segmentFrameCount
        continue
      }

      bufferData.addPendingRange(currentSegmentStartTime, currentSegmentEndTime)
      const resourceURL = getResourceURL({
        type: 'geometry',
        geometryType: GeometryType.Unify,
        manifestPath: manifestPath,
        target: target,
        index: segmentIndex,
        path: (manifest as ManifestSchema).geometry.path,
        format: 'uniform-solve'
      })

      loadGLTF(resourceURL)
        .then((currentFrameData) => {
          const positionMorphAttributes = currentFrameData.mesh.geometry.morphAttributes
            .position as InterleavedBufferAttribute[]
          const normalMorphAttributes = currentFrameData.mesh.geometry.morphAttributes
            .normal as InterleavedBufferAttribute[]

          // console.log('Segment Mesh: ', currentFrameData.mesh)

          positionMorphAttributes.map((attribute, index) => {
            collection[segmentOffset + index] = {
              position: attribute,
              normal: normalMorphAttributes ? normalMorphAttributes[index] : undefined
            }
          })

          if (mesh.geometry.attributes.position.count !== currentFrameData.mesh.geometry.attributes.position.count) {
            if ((currentFrameData.mesh.material as MeshStandardMaterial).map) {
              const texture = (currentFrameData.mesh.material as MeshStandardMaterial).map
              if (texture) {
                repeat.current.copy(texture.repeat)
                offset.current.copy(texture.offset)
              }
            }

            console.log('Initiailizing Unify Geometry')

            const material = mesh.material

            // @ts-ignore
            mesh.copy(currentFrameData.mesh)
            mesh.material = material
            mesh.material.needsUpdate = true

            for (const attribute in currentFrameData.mesh.geometry.attributes) {
              mesh.geometry.attributes[attribute] = currentFrameData.mesh.geometry.attributes[attribute]
              mesh.geometry.attributes[attribute].needsUpdate = true
            }
            if (currentFrameData.mesh.geometry.index) {
              mesh.geometry.index = currentFrameData.mesh.geometry.index
              mesh.geometry.index.needsUpdate = true
            }

            mesh.geometry.morphAttributes = {}
            mesh.morphTargetDictionary = undefined
            mesh.morphTargetInfluences = undefined
          }

          bufferData.addBufferedRange(currentSegmentStartTime, currentSegmentEndTime, currentFrameData.fetchTime)

          if (!initialBufferLoaded.value) {
            const startTime = (startTimeInMS * TIME_UNIT_MULTIPLIER) / 1000
            const endTime = startTime + bufferLimits.geometry[geometryType].initialBufferDuration * TIME_UNIT_MULTIPLIER

            const startFrameBufferData = bufferData.getIntersectionDuration(startTime, endTime)
            if (startFrameBufferData.missingDuration === 0 && startFrameBufferData.pendingDuration === 0) {
              initialBufferLoaded.set(true)
            }
          }
        })
        .catch((err) => {
          console.warn('Error in loading unify frame: ', err)
        })
      currentFrame += segmentFrameCount
    }
  }
}

interface deleteUsedGeometryBuffersProps {
  currentTimeInMS: number
  bufferData?: BufferDataContainer
  geometryType: GeometryType
  geometryBuffer: Map<string, (Mesh<BufferGeometry, Material> | BufferGeometry | KeyframeAttribute)[]>
  mesh: Mesh<BufferGeometry, ShaderMaterial>
  targetData?: Record<string, DRACOTarget | UniformSolveTarget>
  frameRate?: number
  clearAll?: boolean
}

export const deleteUsedGeometryBuffers = ({
  currentTimeInMS,
  bufferData,
  geometryType,
  geometryBuffer,
  targetData,
  frameRate,
  mesh,
  clearAll = false
}: deleteUsedGeometryBuffersProps) => {
  if (geometryType === GeometryType.Corto || geometryType === GeometryType.Draco) {
    let _frameRate = frameRate || 1

    for (const [target, collection] of geometryBuffer) {
      if (!geometryBuffer.has(target) || !collection || !targetData || !targetData[target]) {
        continue
      }
      if (geometryType === GeometryType.Draco) {
        _frameRate = targetData ? targetData[target].frameRate : 1
      }

      const toBeDeletedKeys = [] as number[]

      collection.every((geometryObj, frameNo) => {
        const frameStartTimeInMS = (frameNo * 1000) / _frameRate
        const frameEndTimeInMS = ((frameNo + 1) * 1000) / _frameRate
        if (!clearAll && frameEndTimeInMS >= currentTimeInMS) {
          return false
        }

        ;(geometryObj as BufferGeometry).dispose()
        toBeDeletedKeys.push(frameNo)
        if (!clearAll && bufferData) {
          bufferData.removeBufferedRange(
            frameStartTimeInMS * (TIME_UNIT_MULTIPLIER / 1000),
            frameEndTimeInMS * (TIME_UNIT_MULTIPLIER / 1000)
          )
        }
        return true
      })

      toBeDeletedKeys.forEach((key) => {
        delete collection[key]
      })
    }
  } else if (geometryType === GeometryType.Unify) {
    const oldGeometry = mesh.geometry

    const index = mesh.geometry.index
    const newGeometry = new BufferGeometry()

    newGeometry.setIndex(index)
    for (const key in mesh.geometry.attributes) {
      newGeometry.setAttribute(key, mesh.geometry.attributes[key])
      oldGeometry.deleteAttribute(key)
    }
    newGeometry.boundingSphere = mesh.geometry.boundingSphere
    newGeometry.boundingBox = mesh.geometry.boundingBox

    mesh.geometry = newGeometry

    for (const [target, collection] of geometryBuffer) {
      if (!geometryBuffer.has(target) || !collection || !targetData || !targetData[target]) {
        continue
      }

      const toBeDeletedKeys = [] as number[]
      const _frameRate = targetData ? targetData[target].frameRate : 1

      collection.every((geometryObj, frameNo) => {
        const frameStartTimeInMS = (frameNo * 1000) / _frameRate
        const frameEndTimeInMS = ((frameNo + 1) * 1000) / _frameRate
        if (!clearAll && frameEndTimeInMS >= currentTimeInMS) {
          return false
        }

        const _obj = geometryObj as KeyframeAttribute
        oldGeometry.setAttribute(`position_${frameNo}`, _obj.position)
        if (_obj.normal) {
          oldGeometry.setAttribute(`normal_${frameNo}`, _obj.normal)
        }

        toBeDeletedKeys.push(frameNo)
        if (!clearAll && bufferData) {
          bufferData.removeBufferedRange(
            frameStartTimeInMS * (TIME_UNIT_MULTIPLIER / 1000),
            frameEndTimeInMS * (TIME_UNIT_MULTIPLIER / 1000)
          )
        }

        return true
      })

      toBeDeletedKeys.forEach((key) => {
        delete collection[key]
      })
      oldGeometry.dispose()
    }
  }
}

interface fetchTextureProps extends fetchProps {
  textureType: TextureType
  textureBuffer: Map<string, CompressedTexture[]>
  textureFormat: TextureFormat
  initialBufferLoaded: State<boolean>
  startTimeInMS: number
}

export const fetchTextures = ({
  currentTimeInMS,
  bufferData,
  target,
  manifest,
  textureType,
  manifestPath,
  textureBuffer,
  textureFormat,
  initialBufferLoaded,
  startTimeInMS
}: fetchTextureProps) => {
  const currentTime = currentTimeInMS * (TIME_UNIT_MULTIPLIER / 1000)

  const nextMissing = bufferData.getNextMissing(currentTime)

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const frameRate = (manifest as ManifestSchema).texture[textureType]?.targets[target].frameRate!

  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const frameCount = (manifest as ManifestSchema).texture[textureType]?.targets[target].frameCount!

  const startFrame = Math.floor((nextMissing * frameRate) / TIME_UNIT_MULTIPLIER)
  const maxBufferDuration = Math.max(
    0,
    Math.min(
      isMobile || isMobileXRHeadset
        ? bufferLimits.texture[textureFormat].mobileMaxBufferDuration
        : bufferLimits.texture[textureFormat].desktopMaxBufferDuration,
      (manifest as ManifestSchema).duration - currentTimeInMS / 1000
    )
  )

  if (startFrame >= frameCount || nextMissing - currentTime >= maxBufferDuration * TIME_UNIT_MULTIPLIER) {
    return
  }

  const endFrame = Math.min(
    frameCount - 1,
    Math.floor(((currentTime + maxBufferDuration * TIME_UNIT_MULTIPLIER) * frameRate) / TIME_UNIT_MULTIPLIER)
  )

  if (endFrame < startFrame) return

  if (!textureBuffer.has(target)) {
    textureBuffer.set(target, [])
  }
  const collection = textureBuffer.get(target)!

  for (let currentFrame = startFrame; currentFrame <= endFrame; currentFrame++) {
    const _currentFrame = currentFrame
    const currentFrameStartTime = frameRate > 0 ? (_currentFrame * TIME_UNIT_MULTIPLIER) / frameRate : 0
    const currentFrameEndTime =
      frameRate > 0
        ? ((_currentFrame + 1) * TIME_UNIT_MULTIPLIER) / frameRate
        : (manifest as ManifestSchema).duration * TIME_UNIT_MULTIPLIER
    const currentFrameBufferData = bufferData.getIntersectionDuration(currentFrameStartTime, currentFrameEndTime)
    if (currentFrameBufferData.missingDuration === 0) {
      continue
    }

    bufferData.addPendingRange(currentFrameStartTime, currentFrameEndTime)

    const resourceURL = getResourceURL({
      type: 'texture',
      textureType: textureType,
      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
      format: (manifest as ManifestSchema).texture[textureType]?.targets[target].format!,
      index: _currentFrame,
      target: target,
      path: (manifest as ManifestSchema).texture['baseColor'].path,
      manifestPath: manifestPath
    })

    loadKTX2(resourceURL)
      .then((currentFrameData) => {
        collection[_currentFrame] = currentFrameData.texture

        bufferData.addBufferedRange(currentFrameStartTime, currentFrameEndTime, currentFrameData.fetchTime)

        if (!initialBufferLoaded.value) {
          const startTime = (startTimeInMS * TIME_UNIT_MULTIPLIER) / 1000
          const endTime = startTime + bufferLimits.texture[textureFormat].initialBufferDuration * TIME_UNIT_MULTIPLIER

          const startFrameBufferData = bufferData.getIntersectionDuration(startTime, endTime)
          if (startFrameBufferData.missingDuration === 0 && startFrameBufferData.pendingDuration === 0) {
            initialBufferLoaded.set(true)
          }
        }
      })
      .catch((err) => {
        console.warn('Error in loading ktx2 frame: ', err)
      })
  }
}

interface deleteUsedTextureBuffersProps {
  currentTimeInMS: number
  bufferData?: BufferDataContainer
  textureBuffer: Map<string, CompressedTexture[]>
  targetData?: Record<string, TextureTarget>
  textureType: TextureType
  clearAll?: boolean
}

export const deleteUsedTextureBuffers = ({
  currentTimeInMS,
  bufferData,
  textureBuffer,
  textureType,
  targetData,
  clearAll = false
}: deleteUsedTextureBuffersProps) => {
  for (const [target, collection] of textureBuffer) {
    if (!collection || !targetData || !targetData[target]) {
      continue
    }

    const _frameRate = targetData ? targetData[target].frameRate : 1

    if (_frameRate === 0) {
      // TODO: Handle this case
      continue
    }

    const toBeDeletedKeys = [] as number[]

    collection.every((texture, frameNo) => {
      const frameStartTimeInMS = (frameNo * 1000) / _frameRate
      const frameEndTimeInMS = ((frameNo + 1) * 1000) / _frameRate

      if (_frameRate === 0) {
        if (clearAll) {
          texture.dispose()
          toBeDeletedKeys.push(frameNo)
          if (bufferData) {
            bufferData?.removeBufferedRange(0, Infinity)
          }
        }

        return false
      }

      if (!clearAll && frameEndTimeInMS >= currentTimeInMS) {
        return false
      }

      texture.dispose()
      toBeDeletedKeys.push(frameNo)
      if (!clearAll && bufferData) {
        bufferData.removeBufferedRange(
          frameStartTimeInMS * (TIME_UNIT_MULTIPLIER / 1000),
          frameEndTimeInMS * (TIME_UNIT_MULTIPLIER / 1000)
        )
      }
      return true
    })

    toBeDeletedKeys.forEach((key) => {
      delete collection[key]
    })
  }
}
