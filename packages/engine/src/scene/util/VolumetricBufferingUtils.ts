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

import { isMobile } from '@etherealengine/spatial/src/common/functions/isMobile'
import { isMobileXRHeadset } from '@etherealengine/spatial/src/xr/XRState'
import { BufferGeometry, CompressedTexture, InterleavedBufferAttribute, Material, Mesh } from 'three'
import {
  GeometryType,
  KeyframeAttribute,
  PlayerManifest as ManifestSchema,
  OldManifestSchema,
  TIME_UNIT_MULTIPLIER,
  TextureType,
  UniformSolveTarget,
  bufferLimits
} from '../constants/NewUVOLTypes'
import BufferDataContainer from './BufferDataContainer'
import { getResourceURL, loadDraco, loadGLTF, loadKTX2, rateLimitedCortoLoader } from './VolumetricUtils'

type ResolvedType<T> = T extends Promise<infer R> ? R : never
type DracoResponse = ResolvedType<ReturnType<typeof loadDraco>>
type GLTFResponse = ResolvedType<ReturnType<typeof loadGLTF>>

interface fetchProps {
  manifest: OldManifestSchema | ManifestSchema | Record<string, never>
  manifestPath: string
  currentTimeInMS: number
  bufferData: BufferDataContainer
  target: string
}

interface fetchGeometryProps extends fetchProps {
  geometryType: GeometryType
  geometryBuffer: Map<string, (Mesh<BufferGeometry, Material> | BufferGeometry | KeyframeAttribute)[]>
}

interface fetchTextureProps extends fetchProps {
  textureType: TextureType
  textureBuffer: Map<string, Map<string, CompressedTexture[]>>
}

export const fetchGeometry = ({
  currentTimeInMS,
  bufferData,
  target,
  manifest,
  geometryType,
  manifestPath,
  geometryBuffer
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

  const startFrame = Math.floor((nextMissing * frameRate) / TIME_UNIT_MULTIPLIER)
  const maxBufferDuration = Math.max(
    0,
    Math.min(
      isMobile || isMobileXRHeadset
        ? bufferLimits.texture.mobileMaxBufferDuration
        : bufferLimits.texture.desktopMaxBufferDuration,
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

  if (!geometryBuffer.has(target)) {
    geometryBuffer.set(target, [])
  }
  const collection = geometryBuffer.get(target)!

  for (let currentFrame = startFrame; currentFrame <= endFrame; ) {
    const _currentFrame = currentFrame

    if (geometryType === GeometryType.Corto) {
      bufferData.addRange(
        (_currentFrame * TIME_UNIT_MULTIPLIER) / frameRate,
        ((_currentFrame + 1) * TIME_UNIT_MULTIPLIER) / frameRate,
        -1,
        true
      )
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
          bufferData.addRange(
            (_currentFrame * TIME_UNIT_MULTIPLIER) / frameRate,
            ((_currentFrame + 1) * TIME_UNIT_MULTIPLIER) / frameRate,
            -1,
            false
          )
        })
        .catch((err) => {
          console.warn('Error in loading corto frame: ', err)
        })
      currentFrame++
    } else if (geometryType === GeometryType.Draco || geometryType === GeometryType.GLTF) {
      bufferData.addRange(
        (currentFrame * TIME_UNIT_MULTIPLIER) / frameRate,
        ((currentFrame + 1) * TIME_UNIT_MULTIPLIER) / frameRate,
        -1,
        true
      )
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
          bufferData.addRange(
            (currentFrame * TIME_UNIT_MULTIPLIER) / frameRate,
            ((currentFrame + 1) * TIME_UNIT_MULTIPLIER) / frameRate,
            -1,
            false
          )
        })
        .catch((err) => {
          console.warn('Error in loading draco frame: ', err)
        })
      currentFrame++
    } else if (geometryType === GeometryType.Unify) {
      const targetData = (manifest as ManifestSchema).geometry.targets[target] as UniformSolveTarget
      const segmentFrameCount = targetData.segmentFrameCount!
      const segmentIndex = Math.floor(currentFrame / segmentFrameCount)
      const segmentOffset = segmentIndex * segmentFrameCount

      bufferData.addRange(
        segmentIndex * targetData.settings.segmentSize * TIME_UNIT_MULTIPLIER,
        (segmentIndex + 1) * targetData.settings.segmentSize * TIME_UNIT_MULTIPLIER,
        -1,
        true
      )
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

          positionMorphAttributes.map((attribute, index) => {
            collection[segmentOffset + index] = {
              position: attribute,
              normal: normalMorphAttributes ? normalMorphAttributes[index] : undefined
            }
          })

          bufferData.addRange(
            segmentIndex * targetData.settings.segmentSize * TIME_UNIT_MULTIPLIER,
            (segmentIndex + 1) * targetData.settings.segmentSize * TIME_UNIT_MULTIPLIER,
            currentFrameData.fetchTime,
            false
          )
        })
        .catch((err) => {
          console.warn('Error in loading unify frame: ', err)
        })
      currentFrame += segmentFrameCount
    }
  }
}

export const fetchTextures = ({
  currentTimeInMS,
  bufferData,
  target,
  manifest,
  textureType,
  manifestPath,
  textureBuffer
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
        ? bufferLimits.texture.mobileMaxBufferDuration
        : bufferLimits.texture.desktopMaxBufferDuration,
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

  if (!textureBuffer.has(textureType)) {
    textureBuffer.set(textureType, new Map<string, CompressedTexture[]>())
  }
  const textureTypeCollection = textureBuffer.get(textureType)!
  if (!textureTypeCollection.has(target)) {
    textureTypeCollection.set(target, [])
  }
  const collection = textureTypeCollection.get(target)!

  for (let currentFrame = startFrame; currentFrame <= endFrame; currentFrame++) {
    const _currentFrame = currentFrame
    bufferData.addRange(
      (_currentFrame * TIME_UNIT_MULTIPLIER) / frameRate,
      ((_currentFrame + 1) * TIME_UNIT_MULTIPLIER) / frameRate,
      -1,
      true
    )

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

        bufferData.addRange(
          (_currentFrame * TIME_UNIT_MULTIPLIER) / frameRate,
          ((_currentFrame + 1) * TIME_UNIT_MULTIPLIER) / frameRate,
          currentFrameData.fetchTime,
          false
        )
      })
      .catch((err) => {
        console.warn('Error in loading ktx2 frame: ', err)
      })
  }
}
