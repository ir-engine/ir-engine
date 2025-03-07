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

import { API, PaginationQuery } from '@ir-engine/common'
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
  useChildrenWithComponents,
  useOptionalComponent
} from '@ir-engine/ecs'
import {
  ErrorBoundary,
  NO_PROXY,
  defineState,
  getMutableState,
  useHookstate,
  useImmediateEffect,
  useMutableState
} from '@ir-engine/hyperflux'
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
import React, { Suspense, useEffect } from 'react'
import { Color, Euler, Material, Mesh, Quaternion, SphereGeometry } from 'three'

import { useFind } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import { getChildrenWithComponents } from '@ir-engine/ecs'
import { useGLTFComponent, useTexture } from '@ir-engine/engine/src/assets/functions/resourceLoaderHooks'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { setCameraFocusOnBox } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { BackgroundComponent, SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
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

const uploadThumbnail = async (src: string, projectName: string, blob: Blob | null) => {
  if (!blob) return
  const thumbnailMode = 'automatic'
  const thumbnailKey = generateThumbnailKey(src, projectName)
  const file = new File([blob], thumbnailKey)
  try {
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

    const fileURL = new URL(src)
    fileURL.search = ''
    fileURL.hash = ''
    const fileKeyKey = fileURL.href.replace(config.client.fileServer + '/', '')

    await API.instance
      .service(staticResourcePath)
      .find({
        query: { key: { $in: [fileKeyKey] } }
      })
      .then((reponse) => {
        if (reponse.data.length > 0) {
          const staticResourceId = reponse.data[0].id
          const updateThumbnailKey = async (staticResourceId) => {
            await API.instance
              .service(staticResourcePath)
              .patch(staticResourceId, { thumbnailKey: _thumbnailKey, thumbnailMode, project: projectName })
          }
          updateThumbnailKey(staticResourceId)
        } else {
          console.error('static Resource not foudn for key - ', fileKeyKey)
        }
      })
      .catch((e) => console.error(e))
  } catch {
    ;(e) => console.error(e)
  }
}

export const removeFromFileThumbnailsSeen = (files: readonly string[]) => {
  const jobState = getMutableState(FileThumbnailJobState)
  const seenResources = jobState.seenResources.get(NO_PROXY) as string[]
  files.forEach((file) => {
    const index = seenResources.indexOf(file)
    if (index >= 0) {
      seenResources.splice(index, 1)
    }
  })
  jobState.seenResources.set(seenResources)
}

export const FileThumbnailJobState = defineState({
  name: 'FileThumbnailJobState',
  initial: {
    seenResources: [] as string[],
    jobs: [] as ThumbnailJob[]
  },
  reactor: () => <ThumbnailJobReactor />,
  removeCurrentJob: () => {
    const jobState = getMutableState(FileThumbnailJobState)
    jobState.jobs.set((prev) => {
      prev.splice(0, 1)
      return prev
    })
  },
  useGenerateThumbnails: async (files: readonly FileBrowserContentType[]) => {
    const jobState = useMutableState(FileThumbnailJobState)
    const seenResources = jobState.seenResources

    const fileList = files
      .map((file) => (file.thumbnailURL || file.type === 'folder' ? undefined : file.key))
      .filter((key) => key !== undefined)
      .filter((key) => !seenResources.value.includes(key))

    const query = {
      key: {
        $in: fileList
      },
      thumbnailKey: 'null'
    } as PaginationQuery

    const resourceQuery = useFind(staticResourcePath, {
      query: query
    })

    /**
     * This useEffect will continuously check for new resources that need thumbnails generated until all resources have thumbnails
     */
    useEffect(() => {
      for (const resource of resourceQuery.data) {
        if (seenResources.value.includes(resource.key)) continue
        seenResources.merge([resource.key])

        if (resource.type === 'thumbnail') {
          //set thumbnail's thumbnail as itself
          API.instance
            .service(staticResourcePath)
            .patch(resource.id, { thumbnailKey: resource.key, project: resource.project })
          continue
        }

        if (resource.thumbnailKey != null || !extensionCanHaveThumbnail(resource.key.split('.').pop() ?? '')) continue

        const fileJobs = getMutableState(FileThumbnailJobState).jobs
        if (
          fileJobs.value.filter((fj) => {
            fj.key === resource.url
          }).length < 1
        ) {
          fileJobs.merge([
            {
              key: resource.url,
              project: resource.project!
            }
          ])
        }
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
  onError: (err) => void
}

const renderThumbnail = (
  entity: Entity,
  lightEntity: Entity,
  skyboxEntity: Entity,
  cameraEntity: Entity,
  props: RenderThumbnailProps
) => {
  const { src, project, onError } = props

  tryCatch(() => {
    setCameraFocusOnBox(entity, cameraEntity)
    const camera = getComponent(cameraEntity, CameraComponent)
    const viewCamera = camera.cameras[0]

    viewCamera.layers.mask = ObjectLayerMaskComponent.mask[cameraEntity]
    setComponent(cameraEntity, RendererComponent, { scenes: [entity, lightEntity, skyboxEntity] })

    const renderer = getComponent(cameraEntity, RendererComponent)
    const { scene, canvas, scenes } = renderer
    const entitiesToRender = scenes.map(getNestedVisibleChildren).flat()
    const { background, children } = getSceneParameters(entitiesToRender, cameraEntity)
    scene.children = children
    scene.background = background
    render(renderer, renderer.scene, getComponent(cameraEntity, CameraComponent), 0, false)

    canvas!.toBlob((blob: Blob) => {
      tryCatch(
        () =>
          uploadThumbnail(src, project, blob).then(() => {
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
  const { src, project, onError } = props

  useEffect(() => {
    if (!src) return

    tryCatch(() => {
      const video = document.createElement('video')
      video.src = src
      video.crossOrigin = 'anonymous'
      seekVideo(video, 1)
        .then(() => drawToCanvas(video))
        .then(getCanvasBlob)
        .then((blob) => tryCatch(() => uploadThumbnail(src, project, blob), onError))
        .then(() => video.remove())
        .then(() => FileThumbnailJobState.removeCurrentJob())
    }, onError)
  }, [src])
  return null
}

const RenderImageThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, onError } = props

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
        .then((blob) => tryCatch(() => uploadThumbnail(src, project, blob), onError))
        .then(() => FileThumbnailJobState.removeCurrentJob())
    }, onError)
  }, [src])
  return null
}

const RenderModelThumbnail = (props: RenderThumbnailProps) => {
  const { src, onError } = props
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
  const { src, project, onError } = props
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
        .then((blob) => tryCatch(() => uploadThumbnail(src, project, blob), onError))
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
  const { src, project, onError } = props
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
  const { src, onError } = props
  const [entity, lightEntity, skyboxEntity, cameraEntity] = useRenderEntities(src)
  const errors = ErrorComponent.useComponentErrors(entity, GLTFComponent)
  const [lookdevSkybox] = useChildrenWithComponents(entity, [SkyboxComponent])
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
  const { key: src, project } = currentJob.value ?? { key: '', project: '', id: '' }
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
    if (jobState.jobs.length > 0) {
      const newJob = jobState.jobs[0].get(NO_PROXY)
      currentJob.set(JSON.parse(JSON.stringify(newJob)))
    } else {
      currentJob.set(null)
    }
  }, [jobState.jobs.length])

  const renderThumbnailForType = (type: ThumbnailFileType) => {
    switch (type) {
      case 'video':
        return <RenderVideoThumbnail src={src} project={project} onError={onError} />
      case 'image':
        return <RenderImageThumbnail src={src} project={project} onError={onError} />
      case 'model':
        return <RenderModelThumbnail src={src} project={project} onError={onError} />
      case 'texture':
        return <RenderTextureThumbnail src={src} project={project} onError={onError} />
      case 'material':
        return <RenderMaterialThumbnail src={src} project={project} onError={onError} />
      case 'lookDev':
        return <RenderLookDevThumbnail src={src} project={project} onError={onError} />
      default:
        return null
    }
  }

  const ErrorFallback = () => {
    useEffect(() => {
      FileThumbnailJobState.removeCurrentJob()
    }, [])
    return null
  }

  return fileType && currentJob.value ? (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense>{renderThumbnailForType(fileType)}</Suspense>
    </ErrorBoundary>
  ) : null
}
