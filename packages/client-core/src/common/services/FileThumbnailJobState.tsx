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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
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
  EntityID,
  SourceID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
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
  getNestedVisibleChildren,
  getSceneParameters,
  render
} from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import createReadableTexture from '@ir-engine/spatial/src/renderer/functions/createReadableTexture'
import {
  BoundingBoxComponent,
  updateBoundingBox
} from '@ir-engine/spatial/src/transform/components/BoundingBoxComponent'
import React, { Suspense, useEffect, useRef } from 'react'
import { Color, Euler, Material, Mesh, Quaternion, SphereGeometry } from 'three'

import { useFind } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import { getChildrenWithComponents } from '@ir-engine/ecs'
import { uploadProjectFiles } from '@ir-engine/editor/src/functions/assetFunctions'
import { useGLTFComponent, useTexture } from '@ir-engine/engine/src/assets/functions/resourceLoaderHooks'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import {
  CameraViewAngle,
  setCameraFocusOnBox,
  setCameraFocusOnBoxFromAngle
} from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { RendererComponent } from '@ir-engine/spatial/src/renderer/components/RendererComponent'
import { BackgroundComponent, SceneComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { ObjectLayers } from '@ir-engine/spatial/src/renderer/constants/ObjectLayers'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import { createHash } from 'crypto'
import mime from 'mime-types'
import { uploadToFeathersService } from '../../util/upload'
import { getCanvasBlob } from '../utils'

const ASSET_API_ENDPOINT = `${globalThis.process.env.VITE_MIDDLEWARE_API_URL}/assets`

const getFilename = (path) => {
  return path.substring(path.lastIndexOf('/') + 1) // Get the filename after the last "/"
}

export function generateThumbnailKey(src: string, projectName: string): string {
  const uniqueFileName = `${projectName}-${getFilename(`${window.location}/${src}`)}-${Date.now()}`
  const encoder = new TextEncoder()
  const buffer = encoder.encode(uniqueFileName)
  let hash = createHash('sha256').update(buffer).digest('hex')
  hash = hash.slice(0, 46) // Ensuring max length constraint with VALID_FILENAME_REGEX
  return `${hash}.png`
}

type ThumbnailJob = {
  key: string
  project: string // the project name
  jobType: 'thumbnail' | 'dimension' | 'cv processing'
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
export const uploadDimension = async (modelEntity: Entity, src: string, projectName: string) => {
  try {
    setComponent(modelEntity, BoundingBoxComponent)
    updateBoundingBox(modelEntity)
    const boundingBox = getComponent(modelEntity, BoundingBoxComponent).box
    const dimensions_x = boundingBox.max.x - boundingBox.min.x
    const dimensions_y = boundingBox.max.y - boundingBox.min.y
    const dimensions_z = boundingBox.max.z - boundingBox.min.z
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
          const updateDimension = async (staticResourceId) => {
            await API.instance.service(staticResourcePath).patch(staticResourceId, {
              width: dimensions_x,
              height: dimensions_y,
              depth: dimensions_z,
              project: projectName
            })
          }
          updateDimension(staticResourceId)
        } else {
          console.error('static Resource not foudn for key - ', fileKeyKey)
        }
      })
      .catch((e) => console.error(e))
  } catch (e) {
    console.error('error in uploadDimension', e)
  }
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = reader.result?.toString().split(',')[1] || ''
      resolve(base64String)
    }
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(blob)
  })
}

const uploadToCVProcessor = async (modelEntity: Entity, src: string, projectName: string, blob: Blob | null) => {
  // Process multi-view renderings using middleware assets microservice

  if (!blob) return

  setComponent(modelEntity, BoundingBoxComponent)
  updateBoundingBox(modelEntity)
  const boundingBox = getComponent(modelEntity, BoundingBoxComponent).box
  const dimensions_x = boundingBox.max.x - boundingBox.min.x
  const dimensions_y = boundingBox.max.y - boundingBox.min.y
  const dimensions_z = boundingBox.max.z - boundingBox.min.z

  const base64_image = await blobToBase64(blob)

  const data = {
    type: 'image_b64',
    filename: src.split('/').pop()?.split('?')[0],
    mime_type: 'image/png',
    data_base64: base64_image,
    dimensions: { x: dimensions_x, y: dimensions_y, z: dimensions_z }
  }

  const jsonData = JSON.stringify(data)

  const url = `${ASSET_API_ENDPOINT}/process`
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: jsonData
  }

  fetch(url, options)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Error processing multi-view images: Status: ${response.status}`)
      }
      return response.json()
    })
    .then((responseData) => {
      console.log('Sucessfully processed multi-view images:', responseData)
    })
    .catch((error) => {
      console.error('Error processing multi-view images:', error)
    })
}

const uploadThumbnail = async (src: string, projectName: string, blob: Blob | null) => {
  if (!blob) return
  const thumbnailMode = 'automatic'
  const thumbnailKey = generateThumbnailKey(src, projectName)
  const mimetype = mime.lookup(thumbnailKey) || 'application/octet-stream'
  const file = new File([blob], thumbnailKey, { type: mimetype })
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
          console.error('static Resource not found for key - ', fileKeyKey)
        }
      })
      .catch((e) => console.error(e))
  } catch {
    ;(e) => console.error(e)
  }
}
const useGenerateHelper = (
  files: readonly FileBrowserContentType[],
  filterKey: (file: FileBrowserContentType) => string | undefined,
  queryConditions: Record<string, any>,
  jobType: 'thumbnail' | 'dimension' | 'cv processing' = 'thumbnail'
) => {
  const jobState = useMutableState(FileThumbnailJobState)
  const seenResources = jobState.seenResources[jobType]
  const fileList = files
    .map(filterKey)
    .filter((key): key is string => key !== undefined)
    .filter((key) => !seenResources.value.includes(key))

  const resourceQuery = useFind(staticResourcePath, {
    query: {
      key: { $in: fileList },
      ...queryConditions
    } as PaginationQuery
  })

  useEffect(() => {
    for (const resource of resourceQuery.data) {
      if (seenResources.value.includes(resource.key)) continue
      seenResources.merge([resource.key])
      if (jobType === 'thumbnail') {
        if (resource.type === 'thumbnail') {
          API.instance.service(staticResourcePath).patch(resource.id, {
            thumbnailKey: resource.key,
            project: resource.project
          })
          continue
        }

        const ext = resource.key.split('.').pop() ?? ''
        if (resource.thumbnailKey != null || !extensionCanHaveThumbnail(ext)) {
          continue
        }
      }
      const fileJobs = getMutableState(FileThumbnailJobState).jobs
      if (jobType === 'dimension') {
        // Get the file extension to check if it can have dimension
        let ext = resource.key
        if (ext.endsWith('.material.gltf')) {
          ext = 'material.gltf'
        } else if (ext.endsWith('.lookdev.gltf')) {
          ext = 'lookdev.gltf'
        } else {
          ext = ext.split('.').pop() ?? ''
        }

        if (!extensionCanHaveDimension(ext)) {
          //skip assets that cannot have dimension
          continue
        }
      }

      if (fileJobs.value.filter((fj) => fj.key === resource.url && fj.jobType === jobType).length < 1) {
        fileJobs.merge([
          {
            key: resource.url,
            project: resource.project!,
            jobType: jobType
          }
        ])
      }
    }
    // If there are more files left to be processed in the list we have specified, refetch the query
    if (resourceQuery.total > resourceQuery.data.length) resourceQuery.refetch()
  }, [resourceQuery.data])
}
export const removeFromFileThumbnailsSeen = (
  files: readonly string[],
  jobType: 'thumbnail' | 'dimension' = 'thumbnail'
) => {
  const jobState = getMutableState(FileThumbnailJobState)
  const seenResources = jobState.seenResources[jobType].get(NO_PROXY) as string[]
  files.forEach((file) => {
    const index = seenResources.indexOf(file)
    if (index >= 0) {
      seenResources.splice(index, 1)
    }
  })
  jobState.seenResources[jobType].set(seenResources)
}

export const generateMultiViewThumbnails = (url: string, projectName: string) => {
  FileThumbnailJobState.generateMultiViewThumbnails(url, projectName)
}

export const FileThumbnailJobState = defineState({
  name: 'FileThumbnailJobState',
  initial: {
    seenResources: {
      thumbnail: [] as string[],
      dimension: [] as string[]
    },
    jobs: [] as ThumbnailJob[]
  },
  reactor: () => <ThumbnailJobReactor />,
  removeCurrentJob: () => {
    const jobState = getMutableState(FileThumbnailJobState)
    jobState.jobs.set((prev) => {
      prev.splice(0, 1) // remove the first job
      return [...prev]
    })
  },

  useGenerateThumbnails: (files: readonly FileBrowserContentType[]) => {
    useGenerateHelper(files, (file) => (file.thumbnailURL || file.type === 'folder' ? undefined : file.key), {
      thumbnailKey: 'null'
    })
  },
  useGenerateDimensions: (files: readonly FileBrowserContentType[]) => {
    useGenerateHelper(
      files,
      (file) => (file.type === 'gltf' || file.type === 'glb' ? file.key : undefined),
      {
        $and: [{ width: null }, { height: null }, { depth: null }]
      },
      'dimension'
    )
  },
  generateMultiViewThumbnails: (url: string, projectName: string) => {
    const jobState = getMutableState(FileThumbnailJobState)
    const fileJobs = jobState.jobs

    // Check if this job is already in the queue
    if (fileJobs.value.filter((fj) => fj.key === url && fj.jobType === 'cv processing').length < 1) {
      fileJobs.merge([
        {
          key: url,
          project: projectName,
          jobType: 'cv processing'
        }
      ])
    } else {
      console.log(`Multi-view thumbnail job for ${url} already in queue`)
    }
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

export const extensionCanHaveDimension = (ext: string): boolean => {
  const fileType = extensionThumbnailTypeMap.get(ext)
  // Only model files can have dimensions, but exclude material and lookdev assets
  return fileType === 'model' && ext !== 'material.gltf' && ext !== 'lookdev.gltf'
}

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
    setComponent(entity, UUIDComponent, {
      entitySourceID: 'thumbnail-job' as SourceID,
      entityID: src as EntityID
    })
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
  jobType?: 'thumbnail' | 'dimension' | 'cv processing'
}

const renderThumbnailFromAngle = (
  entity: Entity,
  lightEntity: Entity,
  skyboxEntity: Entity,
  cameraEntity: Entity,
  viewAngle: CameraViewAngle
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    try {
      // Set camera position based on the view angle
      setCameraFocusOnBoxFromAngle(entity, cameraEntity, viewAngle)

      const camera = getComponent(cameraEntity, CameraComponent)
      camera.layers.set(ObjectLayers.Scene)

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
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      })
    } catch (error) {
      reject(error)
    }
  })
}
const renderMultiViewImages = async (
  entity: Entity,
  lightEntity: Entity,
  skyboxEntity: Entity,
  cameraEntity: Entity,
  props: RenderThumbnailProps
): Promise<void> => {
  const { src, onError } = props

  try {
    // Define the six standard view angles
    const viewAngles = [
      CameraViewAngle.FRONT,
      CameraViewAngle.BACK,
      CameraViewAngle.LEFT,
      CameraViewAngle.RIGHT,
      CameraViewAngle.TOP,
      CameraViewAngle.BOTTOM
    ]

    // Create a combined canvas for all six views
    // Each thumbnail is 256x256, create a 3x2 grid (768x512)
    const combinedCanvas = document.createElement('canvas')
    combinedCanvas.width = 768 // 3 thumbnails wide
    combinedCanvas.height = 512 // 2 thumbnails tall
    const ctx = combinedCanvas.getContext('2d')

    if (!ctx) {
      throw new Error('Failed to get canvas context')
    }

    // Fill with a light gray background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, combinedCanvas.width, combinedCanvas.height)

    // Render each view and add it to the combined canvas
    const thumbnailSize = 256
    const blobs: Blob[] = []

    for (let i = 0; i < viewAngles.length; i++) {
      const angle = viewAngles[i]
      // Get a readable label from the enum value
      const label = angle.charAt(0).toUpperCase() + angle.slice(1)

      const blob = await renderThumbnailFromAngle(entity, lightEntity, skyboxEntity, cameraEntity, angle)
      blobs.push(blob)

      // Convert blob to image
      const img = await createImageFromBlob(blob)

      // Calculate position in the grid (0,0 is top-left)
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = col * thumbnailSize
      const y = row * thumbnailSize

      // Draw the image
      ctx.drawImage(img, x, y, thumbnailSize, thumbnailSize)

      // // Add a label
      // ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      // ctx.fillRect(x, y + thumbnailSize - 30, thumbnailSize, 30)
      // ctx.fillStyle = 'white'
      // ctx.font = 'bold 16px Arial'
      // ctx.textAlign = 'center'
      // ctx.textBaseline = 'middle'
      // ctx.fillText(label, x + thumbnailSize / 2, y + thumbnailSize - 15)
    }

    // Convert the combined canvas to a blob and save it to the project
    const combinedBlob = await new Promise<Blob | null>((resolve) => {
      combinedCanvas.toBlob(resolve, 'image/png')
    })

    if (combinedBlob) {
      try {
        // save combined views image to the project/public/multi-view folder
        const fileName =
          src
            .split('/')
            .pop()
            ?.replace(/\.[^.]+$/, '') || 'model'
        const multiViewFileName = `${fileName}_multiview.png`
        const imageFile = new File([combinedBlob], multiViewFileName, { type: 'image/png' })
        const projectName = props.project
        const multiViewFolder = `projects/${projectName}/public/multi-view`
        await uploadProjectFiles(projectName, [imageFile], [multiViewFolder]).promises[0]
        console.log(`Saved multi-view image to ${multiViewFolder}/${imageFile.name}`)
      } catch (error) {
        console.error('Error saving multi-view image:', error)
        onError(error)
      }
    }

    // Process multi-view images using middleware assets microservice
    try {
      console.log(`Processing multi-view images for ${src}`)
      await uploadToCVProcessor(entity, src, props.project, combinedBlob)
    } catch (error) {
      console.error('Error processing multi-view images:', error)
      onError(error)
    }
    //job completed
    FileThumbnailJobState.removeCurrentJob()
  } catch (error) {
    onError(error)
  }
}

const createImageFromBlob = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = URL.createObjectURL(blob)
  })
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
    camera.layers.set(ObjectLayers.Scene)

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
  const { src, onError, jobType } = props
  const [entity, lightEntity, skyboxEntity, cameraEntity] = useRenderEntities(src)
  const errors = ErrorComponent.useComponentErrors(entity, GLTFComponent)
  const loaded = GLTFComponent.useSceneLoaded(entity)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Set a 10 second timeout
    timeoutRef.current = setTimeout(() => {
      if (!loaded && !errors) {
        console.warn(`Thumbnail generation timed out after 10 seconds for ${src}`)
        FileThumbnailJobState.removeCurrentJob()
      }
    }, 10000) // 10 seconds

    // Clear timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [src])

  useEffect(() => {
    if (!entity || !lightEntity || !skyboxEntity || !cameraEntity) return
    setComponent(entity, GLTFComponent, { src, cameraOcclusion: false })
  }, [entity, lightEntity, skyboxEntity, cameraEntity])

  useEffect(() => {
    if (loaded || errors) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }

    if (!loaded) return
    if (jobType === 'dimension') {
      tryCatch(
        () => {
          uploadDimension(entity, src, props.project).then(() => {
            FileThumbnailJobState.removeCurrentJob()
          })
        },
        (err) => onError(err)
      )
    } else if (jobType === 'thumbnail') {
      console.log('upload thumbnail')
      renderThumbnail(entity, lightEntity, skyboxEntity, cameraEntity, props)
    } else if (jobType === 'cv processing') {
      console.log('rendering multi-view images')
      renderMultiViewImages(entity, lightEntity, skyboxEntity, cameraEntity, props)
    }
  }, [loaded, jobType])

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

    const materialEntity = getChildrenWithComponents(gltfEntity, [MaterialStateComponent])[0]
    if (!materialEntity) {
      onError(`No material found in gltf with source: ${src}`)
      return
    }
    const material = getComponent(materialEntity, MaterialStateComponent).material
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
  const { key: src, project, jobType } = currentJob.value ?? { key: '', project: '', id: '' }
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

  const onError = (err: any) => {
    console.error('failed to generate thumbnail for', src)
    console.error(err)
    FileThumbnailJobState.removeCurrentJob()
  }

  useEffect(() => {
    if (jobState.jobs.length > 0) {
      const newJob = jobState.jobs[0].get(NO_PROXY)
      currentJob.set({
        key: newJob.key,
        project: newJob.project,
        jobType: newJob.jobType
      })
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
        return <RenderModelThumbnail src={src} project={project} onError={onError} jobType={jobType} />
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
