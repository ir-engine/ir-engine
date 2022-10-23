import React, { useEffect } from 'react'
import { LinearMipmapLinearFilter, sRGBEncoding, Texture } from 'three'

import { createHookableFunction } from '@xrengine/common/src/utils/createHookableFunction'
import { useHookstate } from '@xrengine/hyperflux'

import { AssetLoader } from '../../../assets/classes/AssetLoader'
import { AssetClass } from '../../../assets/enum/AssetClass'
import { ComponentDeserializeFunction } from '../../../common/constants/PrefabFunctionType'
import { Entity } from '../../../ecs/classes/Entity'
import {
  getComponent,
  serializeComponent,
  SerializedComponentType,
  setComponent,
  useComponent
} from '../../../ecs/functions/ComponentFunctions'
import { EntityReactorProps } from '../../../ecs/functions/EntityFunctions'
import { EngineRenderer } from '../../../renderer/WebGLRendererSystem'
import { ImageAlphaMode, ImageProjection } from '../../classes/ImageUtils'
import { addObjectToGroup, removeObjectFromGroup } from '../../components/GroupComponent'
import {
  ImageComponent,
  PLANE_GEO,
  PLANE_GEO_FLIPPED,
  resizeImageMesh,
  SPHERE_GEO,
  SPHERE_GEO_FLIPPED
} from '../../components/ImageComponent'
import { addError, removeError } from '../../functions/ErrorFunctions'

export const deserializeImage: ComponentDeserializeFunction = (
  entity: Entity,
  data: SerializedComponentType<typeof ImageComponent>
) => {
  if (data['imageSource']) data.source = data['imageSource'] // backwards-compat
  setComponent(entity, ImageComponent, data)
}

export const serializeImage = (entity: Entity) => {
  return serializeComponent(entity, ImageComponent)
}

export const ImageReactor: React.FC<EntityReactorProps> = createHookableFunction(function ImageReactor({
  entity,
  destroyReactor
}) {
  const image = useComponent(entity, ImageComponent)
  const texture = useHookstate(null as Texture | null)

  useEffect(() => {
    if (!image) destroyReactor()
  }, [image])

  useEffect(
    function updateTextureSource() {
      if (!image) return

      const source = image.source.value

      if (!source) {
        return addError(entity, ImageComponent.name, `Image source is missing`)
      }

      const assetType = AssetLoader.getAssetClass(source)
      if (assetType !== AssetClass.Image) {
        return addError(entity, ImageComponent.name, `Image source '${source}' is not a supported image type`)
      }

      texture.set(AssetLoader.loadAsync(source))

      return () => {
        // TODO: abort load request, pending https://github.com/mrdoob/three.js/pull/23070
      }
    },
    [image?.source]
  )

  useEffect(
    function updateTexture() {
      if (!image || !texture.value) return

      if (texture.error) {
        return addError(entity, ImageComponent.name, texture.error)
      }

      texture.value.encoding = sRGBEncoding
      texture.value.minFilter = LinearMipmapLinearFilter

      image.mesh.material.map.ornull?.value.dispose()
      image.mesh.material.map.set(texture.value)
      image.mesh.visible.set(true)
      image.mesh.material.value.needsUpdate = true

      // upload to GPU immediately
      EngineRenderer.instance.renderer.initTexture(texture.value)

      removeError(entity, ImageComponent.name)

      const imageMesh = image.mesh.value
      addObjectToGroup(entity, imageMesh)

      return () => {
        removeObjectFromGroup(entity, imageMesh)
      }
    },
    [texture]
  )

  useEffect(
    function updateGeometry() {
      if (!image?.mesh.material.map.value) return

      const flippedTexture = image.mesh.material.map.value.flipY
      switch (image.projection.value) {
        case ImageProjection.Equirectangular360:
          image.mesh.geometry.set(flippedTexture ? SPHERE_GEO : SPHERE_GEO_FLIPPED)
          image.mesh.scale.value.set(-1, 1, 1)
          break
        case ImageProjection.Flat:
        default:
          image.mesh.geometry.set(flippedTexture ? PLANE_GEO : PLANE_GEO_FLIPPED)
          resizeImageMesh(image.mesh.value)
      }
    },
    [image?.mesh.material.map, image?.projection]
  )

  useEffect(
    function updateMaterial() {
      if (!image) return
      image.mesh.material.transparent.set(image.alphaMode.value === ImageAlphaMode.Blend)
      image.mesh.material.alphaTest.set(image.alphaMode.value === 'Mask' ? image.alphaCutoff.value : 0)
      image.mesh.material.side.set(image.side.value)
      image.mesh.material.value.needsUpdate = true
    },
    [image?.alphaMode, image?.alphaCutoff, image?.side]
  )

  return null
})
