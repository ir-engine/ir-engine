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

import { API } from '@ir-engine/common'
import {
  FileBrowserContentType,
  fileBrowserUploadPath,
  staticResourcePath
} from '@ir-engine/common/src/schema.type.module'
import {
  Entity,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  generateEntityUUID,
  getComponent,
  removeEntity,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { NO_PROXY, defineState, getMutableState, useHookstate, useImmediateEffect } from '@ir-engine/hyperflux'
import { DirectionalLightComponent, TransformComponent } from '@ir-engine/spatial'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import {
  RendererComponent,
  getNestedVisibleChildren,
  getSceneParameters,
  render
} from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import createReadableTexture from '@ir-engine/spatial/src/renderer/functions/createReadableTexture'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponents'
import React, { useEffect } from 'react'
import { Color, Euler, Material, Mesh, Quaternion, SphereGeometry } from 'three'

import { useFind } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import { useGLTFComponent, useTexture } from '@ir-engine/engine/src/assets/functions/resourceLoaderHooks'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { setCameraFocusOnBox } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { BackgroundComponent, SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import {
  getChildrenWithComponents,
  useChildWithComponents
} from '@ir-engine/spatial/src/transform/components/EntityTree'
import { uploadToFeathersService } from '../../util/upload'
import { getCanvasBlob } from '../utils'

export function generateThumbnailKey(src: string, projectName: string) {
  return `${decodeURI(stripSearchFromURL(src).replace(/^.*?\/projects\//, ''))
    .replace(projectName + '/', '')
    .replaceAll(/[^a-zA-Z0-9\.\-_\s]/g, '_')
    .replaceAll(/\s/g, '-')}-thumbnail.png`
}

type ThumbnailJob = {
  key: string
  project: string // the project name
  id: string // the existing static resource ID
}

const seekVideo = (video: HTMLVideoElement, time: number): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    video.currentTime = time
    video.onerror = reject
    video.onseeked = () => {
      video.onerror = null
      video.onseeked = null
      resolve()
    }
  })

const drawToCanvas = (source: CanvasImageSource): Promise<HTMLCanvasElement | null> => {
  const canvas = document.createElement('canvas')
  canvas.width = 90
  canvas.height = 90
  const ctx = canvas.getContext('2d')
  if (ctx == null) {
    return Promise.reject()
  }
  ctx.drawImage(source, 0, 0, 90, 90)
  return Promise.resolve(canvas)
}

const uploadThumbnail = async (src: string, projectName: string, staticResourceId: string, blob: Blob | null) => {
  if (!blob) return
  const thumbnailMode = 'automatic'
  const thumbnailKey = generateThumbnailKey(src, projectName)
  const file = new File([blob], thumbnailKey)
  const thumbnailURL = new URL(
    await uploadToFeathersService(fileBrowserUploadPath, [file], {
      args: [
        {
          fileName: file.name,
          project: projectName,
          path: 'public/thumbnails/' + file.name,
          contentType: file.type,
          type: 'thumbnail',
          thumbnailKey,
          thumbnailMode
        }
      ]
    }).promise
  )
  thumbnailURL.search = ''
  thumbnailURL.hash = ''
  const _thumbnailKey = thumbnailURL.href.replace(config.client.fileServer + '/', '')
  await API.instance
    .service(staticResourcePath)
    .patch(staticResourceId, { thumbnailKey: _thumbnailKey, thumbnailMode, project: projectName })
}

const seenResources = new Set<string>()

export const FileThumbnailJobState = defineState({
  name: 'FileThumbnailJobState',
  initial: [] as ThumbnailJob[],
  reactor: () => <ThumbnailJobReactor />,
  removeCurrentJob: () => {
    const jobState = getMutableState(FileThumbnailJobState)
    jobState.set((prev) => {
      prev.splice(0, 1)
      return prev
    })
  },
  useGenerateThumbnails: async (files: readonly FileBrowserContentType[]) => {
    const resourceQuery = useFind(staticResourcePath, {
      query: {
        key: {
          $in: files.map((file) => file.key).filter((key) => !seenResources.has(key))
        },
        thumbnailKey: 'null'
      }
    })

    /**
     * This useEffect will continuously check for new resources that need thumbnails generated until all resources have thumbnails
     */
    useEffect(() => {
      for (const resource of resourceQuery.data) {
        if (seenResources.has(resource.key)) continue
        seenResources.add(resource.key)

        if (resource.type === 'thumbnail') {
          //set thumbnail's thumbnail as itself
          API.instance
            .service(staticResourcePath)
            .patch(resource.id, { thumbnailKey: resource.key, project: resource.project })
          continue
        }

        if (resource.thumbnailKey != null || !extensionCanHaveThumbnail(resource.key.split('.').pop() ?? '')) continue

        getMutableState(FileThumbnailJobState).merge([
          {
            key: resource.url,
            project: resource.project!,
            id: resource.id
          }
        ])
      }

      // If there are more files left to be processed in the list we have specified, refetch the query
      if (resourceQuery.total > resourceQuery.data.length) resourceQuery.refetch()
    }, [resourceQuery.data])
  }
})

type ThumbnailFileType = 'image' | 'model' | 'texture' | 'video' | 'material' | 'lookDev'

const extensionThumbnailTypes: { extensions: string[]; thumbnailType: ThumbnailFileType }[] = [
  { extensions: ['material.gltf'], thumbnailType: 'material' },
  { extensions: ['lookdev.gltf'], thumbnailType: 'lookDev' },
  { extensions: ['gltf', 'glb', 'vrm', 'usdz', 'fbx'], thumbnailType: 'model' },
  { extensions: ['png', 'jpeg', 'jpg'], thumbnailType: 'image' },
  { extensions: ['ktx2'], thumbnailType: 'texture' },
  { extensions: ['mp4', 'm3u8'], thumbnailType: 'video' }
]
const extensionThumbnailTypeMap = new Map<string, ThumbnailFileType>()
for (const { extensions, thumbnailType } of extensionThumbnailTypes) {
  for (const extension of extensions) {
    extensionThumbnailTypeMap.set(extension, thumbnailType)
  }
}

const stripSearchFromURL = (url: string): string => {
  if (!url.includes('?')) return url
  const cleanURL = new URL(url)
  cleanURL.search = ''
  return cleanURL.href
}

export const extensionCanHaveThumbnail = (ext: string): boolean => extensionThumbnailTypeMap.has(ext)

const tryCatch = (fn: (...args: any[]) => void, onError: (err) => void) => {
  try {
    fn()
  } catch (e) {
    onError(e)
  }
}

const useRenderEntities = (src: string): [Entity, Entity, Entity, Entity] => {
  const entityState = useHookstate(UndefinedEntity)
  const lightEntityState = useHookstate(UndefinedEntity)
  const skyboxEntityState = useHookstate(UndefinedEntity)
  const cameraEntityState = useHookstate(UndefinedEntity)
  const renderer = useOptionalComponent(cameraEntityState.value, RendererComponent)?.renderer.value

  useImmediateEffect(() => {
    const entity = createEntity()
    const lightEntity = createEntity()
    const skyboxEntity = createEntity()
    const cameraEntity = createEntity()

    setComponent(entity, NameComponent, 'thumbnail job asset ' + src)
    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, VisibleComponent)
    setComponent(entity, ShadowComponent, { cast: true, receive: true })
    setComponent(entity, BoundingBoxComponent)
    setComponent(entity, SceneComponent)

    setComponent(lightEntity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(-4, -0.5, 0)) })
    setComponent(lightEntity, NameComponent, 'thumbnail job light for ' + src)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, DirectionalLightComponent, { intensity: 1, color: new Color(0xffffff) })

    setComponent(skyboxEntity, NameComponent, 'thumbnail job skybox for ' + src)
    setComponent(skyboxEntity, VisibleComponent)
    //setComponent(skyboxEntity, SkyboxComponent)

    let canvasContainer = document.getElementById('thumbnail-camera-container')
    if (!canvasContainer) {
      canvasContainer = document.createElement('div')
      canvasContainer.id = 'thumbnail-camera-container'
      canvasContainer.style.width = '256px'
      canvasContainer.style.height = '256px'
      document.body.append(canvasContainer)
    }
    const thumbnailCanvas = document.createElement('canvas')
    thumbnailCanvas.width = 256
    thumbnailCanvas.height = 256
    canvasContainer.appendChild(thumbnailCanvas)

    setComponent(cameraEntity, CameraComponent)
    setComponent(cameraEntity, RendererComponent, { canvas: thumbnailCanvas })
    setComponent(cameraEntity, VisibleComponent, true)

    entityState.set(entity)
    lightEntityState.set(lightEntity)
    skyboxEntityState.set(skyboxEntity)
    cameraEntityState.set(cameraEntity)

    return () => {
      removeEntity(entity)
      removeEntity(lightEntity)
      removeEntity(skyboxEntity)
      removeEntity(cameraEntity)
      thumbnailCanvas.remove()
    }
  }, [src])

  return renderer
    ? [entityState.value, lightEntityState.value, skyboxEntityState.value, cameraEntityState.value]
    : [UndefinedEntity, UndefinedEntity, UndefinedEntity, UndefinedEntity]
}

type RenderThumbnailProps = {
  src: string
  project: string
  id: string
  onError: (err) => void
}

const renderThumbnail = (
  entity: Entity,
  lightEntity: Entity,
  skyboxEntity: Entity,
  cameraEntity: Entity,
  props: RenderThumbnailProps
) => {
  const { src, project, id, onError } = props

  tryCatch(() => {
    setCameraFocusOnBox(entity, cameraEntity)
    const camera = getComponent(cameraEntity, CameraComponent)
    const viewCamera = camera.cameras[0]

    viewCamera.layers.mask = getComponent(cameraEntity, ObjectLayerMaskComponent)
    setComponent(cameraEntity, RendererComponent, { scenes: [entity, lightEntity, skyboxEntity] })

    const renderer = getComponent(cameraEntity, RendererComponent)
    const { scene, canvas, scenes } = renderer
    const entitiesToRender = scenes.map(getNestedVisibleChildren).flat()
    const { background, children } = getSceneParameters(entitiesToRender)
    scene.children = children
    scene.background = background
    render(renderer, renderer.scene, getComponent(cameraEntity, CameraComponent), 0, false)

    canvas!.toBlob((blob: Blob) => {
      tryCatch(
        () =>
          uploadThumbnail(src, project, id, blob).then(() => {
            FileThumbnailJobState.removeCurrentJob()
          }),
        (err) => {
          onError(err)
        }
      )
    })
  }, onError)
}

const RenderVideoThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props

  useEffect(() => {
    if (!src) return

    tryCatch(() => {
      const video = document.createElement('video')
      video.src = src
      video.crossOrigin = 'anonymous'
      seekVideo(video, 1)
        .then(() => drawToCanvas(video))
        .then(getCanvasBlob)
        .then((blob) => tryCatch(() => uploadThumbnail(src, project, id, blob), onError))
        .then(() => video.remove())
        .then(() => FileThumbnailJobState.removeCurrentJob())
    }, onError)
  }, [src])
  return null
}

const RenderImageThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props

  useEffect(() => {
    if (!src) return

    tryCatch(() => {
      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = src
      image
        .decode()
        .then(() => drawToCanvas(image))
        .then(getCanvasBlob)
        .then((blob) => tryCatch(() => uploadThumbnail(src, project, id, blob), onError))
        .then(() => FileThumbnailJobState.removeCurrentJob())
    }, onError)
  }, [src])
  return null
}

const RenderModelThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props
  const [entity, lightEntity, skyboxEntity, cameraEntity] = useRenderEntities(src)
  const errors = ErrorComponent.useComponentErrors(entity, GLTFComponent)
  const loaded = GLTFComponent.useSceneLoaded(entity)

  useEffect(() => {
    if (!entity || !lightEntity || !skyboxEntity || !cameraEntity) return
    setComponent(entity, GLTFComponent, { src, cameraOcclusion: false })
  }, [entity, lightEntity, skyboxEntity, cameraEntity])

  useEffect(() => {
    if (!loaded) return
    renderThumbnail(entity, lightEntity, skyboxEntity, cameraEntity, props)
  }, [loaded])

  useEffect(() => {
    if (!errors) return
    onError(errors)
  }, [errors])

  return null
}

const RenderTextureThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props
  const [texture, error] = useTexture(src)

  useEffect(() => {
    if (!texture) return

    tryCatch(() => {
      const image = new Image()
      image.crossOrigin = 'anonymous'

      createReadableTexture(texture, { url: true })
        .then((result) => {
          image.src = result as string
          return image.decode()
        })
        .then(() => drawToCanvas(image))
        .then(getCanvasBlob)
        .then((blob) => tryCatch(() => uploadThumbnail(src, project, id, blob), onError))
        .then(() => image.remove())
        .then(() => FileThumbnailJobState.removeCurrentJob())
    }, onError)
  }, [texture])

  useEffect(() => {
    if (!error) return
    onError(error)
  }, [error])
  return null
}

const RenderMaterialThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props
  const [entity, lightEntity, skyboxEntity, cameraEntity] = useRenderEntities(src)
  const gltfEntity = useGLTFComponent(src, entity)
  const errors = ErrorComponent.useComponentErrors(gltfEntity ?? UndefinedEntity, GLTFComponent)

  useEffect(() => {
    if (!entity || !lightEntity || !skyboxEntity || !cameraEntity || !gltfEntity) return

    const meshEntity = getChildrenWithComponents(gltfEntity, [MeshComponent])[0]
    if (!meshEntity) {
      onError(`No mesh found in gltf with source: ${src}`)
      return
    }

    const material = getComponent(meshEntity, MeshComponent).material
    if (!material) {
      onError(`Failed to load material for thumbnail with source: ${src}`)
      return
    }

    /** @todo Remove the setTimeout when the GLTF loader refactor has been completed */
    setTimeout(() => {
      const sphere = new Mesh(new SphereGeometry(1), material)
      if (Object.hasOwn(sphere.material, 'flatShading')) {
        ;(sphere.material as Material & { flatShading: boolean }).flatShading = false
      }
      addObjectToGroup(entity, sphere)
      setComponent(entity, MeshComponent, sphere)
      renderThumbnail(entity, lightEntity, skyboxEntity, cameraEntity, props)
    }, 1000)
  }, [entity, lightEntity, skyboxEntity, cameraEntity, gltfEntity])

  useEffect(() => {
    if (!errors) return
    onError(errors)
  }, [errors])

  return null
}

const RenderLookDevThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props
  const [entity, lightEntity, skyboxEntity, cameraEntity] = useRenderEntities(src)
  const errors = ErrorComponent.useComponentErrors(entity, GLTFComponent)
  const lookdevSkybox = useChildWithComponents(entity, [SkyboxComponent])
  const backgroundComponent = useOptionalComponent(lookdevSkybox, BackgroundComponent)

  useEffect(() => {
    if (!entity || !lightEntity || !skyboxEntity || !cameraEntity) return
    setComponent(entity, GLTFComponent, { src, cameraOcclusion: false })
  }, [entity, lightEntity, skyboxEntity, cameraEntity])

  useEffect(() => {
    if (!backgroundComponent) return
    renderThumbnail(entity, lightEntity, skyboxEntity, cameraEntity, props)
  }, [backgroundComponent])

  useEffect(() => {
    if (!errors) return
    onError(errors)
  }, [errors])

  return null
}

const ThumbnailJobReactor = () => {
  const jobState = useHookstate(getMutableState(FileThumbnailJobState))
  const currentJob = useHookstate(null as ThumbnailJob | null)
  const { key: src, project, id } = currentJob.value ?? { key: '', project: '', id: '' }
  const strippedSrc = stripSearchFromURL(src)
  let extension = strippedSrc
  if (strippedSrc.endsWith('.material.gltf')) {
    extension = 'material.gltf'
  } else if (strippedSrc.endsWith('.lookdev.gltf')) {
    extension = 'lookdev.gltf'
  } else {
    extension = strippedSrc.split('.').pop() ?? ''
  }
  const fileType = extensionThumbnailTypeMap.get(extension)

  const onError = (err) => {
    console.error('failed to generate thumbnail for', src)
    console.error(err)
    FileThumbnailJobState.removeCurrentJob()
  }

  useEffect(() => {
    if (jobState.length > 0) {
      const newJob = jobState[0].get(NO_PROXY)
      currentJob.set(JSON.parse(JSON.stringify(newJob)))
    } else {
      currentJob.set(null)
    }
  }, [jobState.length])

  const renderThumbnailForType = (type: ThumbnailFileType) => {
    switch (type) {
      case 'video':
        return <RenderVideoThumbnail src={src} project={project} id={id} onError={onError} />
      case 'image':
        return <RenderImageThumbnail src={src} project={project} id={id} onError={onError} />
      case 'model':
        return <RenderModelThumbnail src={src} project={project} id={id} onError={onError} />
      case 'texture':
        return <RenderTextureThumbnail src={src} project={project} id={id} onError={onError} />
      case 'material':
        return <RenderMaterialThumbnail src={src} project={project} id={id} onError={onError} />
      case 'lookDev':
        return <RenderLookDevThumbnail src={src} project={project} id={id} onError={onError} />
      default:
        return null
    }
  }

  return fileType && currentJob.value ? <>{renderThumbnailForType(fileType)}</> : null
}
