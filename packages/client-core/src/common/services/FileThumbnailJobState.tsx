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
  EntityUUID,
  UUIDComponent,
  UndefinedEntity,
  createEntity,
  generateEntityUUID,
  getComponent,
  removeEntity,
  setComponent,
  useOptionalComponent
} from '@ir-engine/ecs'
import { GLTFDocumentState } from '@ir-engine/engine/src/gltf/GLTFDocumentState'
import {
  NO_PROXY,
  defineState,
  getMutableState,
  startReactor,
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
  initializeEngineRenderer,
  render
} from '@ir-engine/spatial/src/renderer/WebGLRendererSystem'
import { ObjectLayerMaskComponent } from '@ir-engine/spatial/src/renderer/components/ObjectLayerComponent'
import { VisibleComponent } from '@ir-engine/spatial/src/renderer/components/VisibleComponent'
import createReadableTexture from '@ir-engine/spatial/src/renderer/functions/createReadableTexture'
import { BoundingBoxComponent } from '@ir-engine/spatial/src/transform/components/BoundingBoxComponents'
import React, { useEffect } from 'react'
import { Color, Euler, Material, MathUtils, Mesh, Quaternion, SphereGeometry, Texture } from 'three'

import { useFind } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import { useTexture } from '@ir-engine/engine/src/assets/functions/resourceLoaderHooks'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { ErrorComponent } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { ShadowComponent } from '@ir-engine/engine/src/scene/components/ShadowComponent'
import { SkyboxComponent } from '@ir-engine/engine/src/scene/components/SkyboxComponent'
import { setCameraFocusOnBox } from '@ir-engine/spatial/src/camera/functions/CameraFunctions'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { BackgroundComponent } from '@ir-engine/spatial/src/renderer/components/SceneComponents'
import { loadMaterialGLTF } from '@ir-engine/spatial/src/renderer/materials/materialFunctions'
import { getChildrenWithComponents } from '@ir-engine/spatial/src/transform/components/EntityTree'
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
  await API.instance.service(staticResourcePath).patch(staticResourceId, { thumbnailKey: _thumbnailKey, thumbnailMode })
}

const seenResources = new Set<string>()

export const FileThumbnailJobState = defineState({
  name: 'FileThumbnailJobState',
  initial: [] as ThumbnailJob[],
  reactor: () => <ThumbnailJobReactor />,
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
          API.instance.service(staticResourcePath).patch(resource.id, { thumbnailKey: resource.key })
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

const useRenderEntities = (src: string): [Entity, Entity, Entity] => {
  const entityState = useHookstate(UndefinedEntity)
  const lightEntityState = useHookstate(UndefinedEntity)
  const skyboxEntityState = useHookstate(UndefinedEntity)

  useImmediateEffect(() => {
    const entity = createEntity()
    const lightEntity = createEntity()
    const skyboxEntity = createEntity()

    setComponent(entity, NameComponent, 'thumbnail job asset ' + src)
    setComponent(entity, UUIDComponent, generateEntityUUID())
    setComponent(entity, VisibleComponent)
    setComponent(entity, ShadowComponent, { cast: true, receive: true })
    setComponent(entity, BoundingBoxComponent)

    setComponent(lightEntity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(-4, -0.5, 0)) })
    setComponent(lightEntity, NameComponent, 'thumbnail job light for ' + src)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, DirectionalLightComponent, { intensity: 1, color: new Color(0xffffff) })

    setComponent(skyboxEntity, NameComponent, 'thumbnail job skybox for ' + src)
    setComponent(skyboxEntity, VisibleComponent)
    //setComponent(skyboxEntity, SkyboxComponent)

    entityState.set(entity)
    lightEntityState.set(lightEntity)
    skyboxEntityState.set(skyboxEntity)

    return () => {
      removeEntity(entity)
      removeEntity(lightEntity)
      removeEntity(skyboxEntity)
    }
  }, [src])

  return [entityState.value, lightEntityState.value, skyboxEntityState.value]
}

type RenderThumbnailProps = {
  src: string
  project: string
  id: string
  onError: (err) => void
}

const renderThumbnail = (entity: Entity, lightEntity: Entity, skyboxEntity: Entity, props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props

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

  const cameraEntity = createEntity()
  setComponent(cameraEntity, CameraComponent)
  setComponent(cameraEntity, RendererComponent, { canvas: thumbnailCanvas })
  initializeEngineRenderer(cameraEntity)
  setComponent(cameraEntity, VisibleComponent, true)

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

    function cleanup() {
      removeEntity(cameraEntity)
      thumbnailCanvas.remove()
      const jobState = getMutableState(FileThumbnailJobState)
      jobState.set(jobState.get(NO_PROXY).slice(1))
    }

    canvas!.toBlob((blob: Blob) => {
      tryCatch(
        () => uploadThumbnail(src, project, id, blob).then(cleanup),
        (err) => {
          cleanup()
          onError(err)
        }
      )
    })
  }, onError)

  // try {
  // } catch (e) {
  //   console.error('failed to generate model thumbnail for', src)
  //   console.error(e)
  //   jobState.set(jobState.get(NO_PROXY).slice(1))
  // }
}

const RenderVideoThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props
  const jobState = useMutableState(FileThumbnailJobState)

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
        .then(() => jobState.set(jobState.get(NO_PROXY).slice(1)))
    }, onError)
  }, [src])
  return null
}

const RenderImageThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props
  const jobState = useMutableState(FileThumbnailJobState)

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
        .then(() => jobState.set(jobState.get(NO_PROXY).slice(1)))
    }, onError)
  }, [src])
  return null
}

const RenderModelThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props
  const jobState = useMutableState(FileThumbnailJobState)
  const [entity, lightEntity, skyboxEntity] = useRenderEntities(src)
  const errors = ErrorComponent.useComponentErrors(entity, GLTFComponent)

  useEffect(() => {
    if (!entity || !lightEntity || !skyboxEntity) return
    setComponent(entity, GLTFComponent, { src, cameraOcclusion: false })
  }, [entity, lightEntity, skyboxEntity])

  useEffect(() => {
    if (!errors) return
    onError(errors)
  }, [errors])

  return null
}

const RenderTextureThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props
  const jobState = useMutableState(FileThumbnailJobState)
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
        .then(() => jobState.set(jobState.get(NO_PROXY).slice(1)))
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
  const jobState = useMutableState(FileThumbnailJobState)
  const [entity, lightEntity, skyboxEntity] = useRenderEntities(src)

  useEffect(() => {
    if (!entity || !lightEntity || !skyboxEntity) return

    loadMaterialGLTF(src, (material) => {
      if (!material) {
        onError(`Failed to load material for thumbnail with source: ${src}`)
      } else {
        const sphere = new Mesh(new SphereGeometry(1), material)
        if (Object.hasOwn(sphere.material, 'flatShading')) {
          ;(sphere.material as Material & { flatShading: boolean }).flatShading = false
        }
        addObjectToGroup(entity, sphere)
        setComponent(entity, MeshComponent, sphere)
      }
    })
  }, [entity, lightEntity, skyboxEntity])
  return null
}

const RenderLookDevThumbnail = (props: RenderThumbnailProps) => {
  const { src, project, id, onError } = props
  const jobState = useMutableState(FileThumbnailJobState)
  const [entity, lightEntity, skyboxEntity] = useRenderEntities(src)
  const errors = ErrorComponent.useComponentErrors(entity, GLTFComponent)

  useEffect(() => {
    if (!entity || !lightEntity || !skyboxEntity) return
    setComponent(entity, GLTFComponent, { src, cameraOcclusion: false })
  }, [entity, lightEntity, skyboxEntity])

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

  const state = useHookstate({
    cameraEntity: UndefinedEntity,
    modelEntity: UndefinedEntity,
    lightEntity: UndefinedEntity,
    skyboxEntity: UndefinedEntity,
    thumbnailCanvas: null as HTMLCanvasElement | null
  })
  const loadPromiseState = useHookstate(null as Promise<any> | null) // for asset loading
  const sceneState = useHookstate(getMutableState(GLTFDocumentState)) // for model rendering
  const lightComponent = useOptionalComponent(state.lightEntity.value, DirectionalLightComponent)
  const errorComponent = useOptionalComponent(state.modelEntity.value, ErrorComponent)

  const materialLoaded = useHookstate(false)
  const skyboxLoaded = useHookstate(false)

  const tryCatch = (fn: any) => {
    try {
      fn()
    } catch (e) {
      console.error('failed to generate thumbnail for', src)
      console.error(e)
      jobState.set(jobState.get(NO_PROXY).slice(1))
    }
  }

  function cleanupState() {
    if (state.cameraEntity.value) {
      removeEntity(state.cameraEntity.value)
      state.cameraEntity.set(UndefinedEntity)
    }
    if (state.modelEntity.value) {
      removeEntity(state.modelEntity.value)
      state.modelEntity.set(UndefinedEntity)
    }
    if (state.lightEntity.value) {
      removeEntity(state.lightEntity.value)
      state.lightEntity.set(UndefinedEntity)
    }
    if (state.skyboxEntity.value) {
      removeEntity(state.skyboxEntity.value)
      state.skyboxEntity.set(UndefinedEntity)
    }
    if (state.thumbnailCanvas.get(NO_PROXY)) {
      state.thumbnailCanvas.get(NO_PROXY)?.remove()
      state.thumbnailCanvas.set(null)
    }
  }

  useEffect(() => {
    if (jobState.length > 0) {
      const newJob = jobState[0].get(NO_PROXY)
      currentJob.set(JSON.parse(JSON.stringify(newJob)))
    } else {
      cleanupState()
    }
  }, [jobState.length])

  // Load models, materails, lookDev
  useEffect(() => {
    if (src === '' || (fileType !== 'model' && fileType !== 'material' && fileType !== 'lookDev')) {
      cleanupState()
      return
    }

    const entity = createEntity()
    setComponent(entity, NameComponent, 'thumbnail job asset ' + src)
    const uuid = MathUtils.generateUUID() as EntityUUID
    setComponent(entity, UUIDComponent, uuid)
    setComponent(entity, VisibleComponent)
    setComponent(entity, ShadowComponent, { cast: true, receive: true })
    setComponent(entity, BoundingBoxComponent)

    const lightEntity = createEntity()
    setComponent(lightEntity, TransformComponent, { rotation: new Quaternion().setFromEuler(new Euler(-4, -0.5, 0)) })
    setComponent(lightEntity, NameComponent, 'thumbnail job light for ' + src)
    setComponent(lightEntity, VisibleComponent)
    setComponent(lightEntity, DirectionalLightComponent, { intensity: 1, color: new Color(0xffffff) })

    const skyboxEntity = createEntity()
    setComponent(skyboxEntity, NameComponent, 'thumbnail job skybox for ' + src)
    setComponent(skyboxEntity, VisibleComponent)
    //setComponent(skyboxEntity, SkyboxComponent)

    if (fileType === 'model') {
      setComponent(entity, GLTFComponent, { src, cameraOcclusion: false })
    } else if (fileType === 'material') {
      if (materialLoaded.value) {
        materialLoaded.set(false)
      }
      loadMaterialGLTF(src, (material) => {
        if (!material) {
          console.error('Failed to load material for thumbnail', src)
        } else {
          const sphere = new Mesh(new SphereGeometry(1), material)
          if (Object.hasOwn(sphere.material, 'flatShading')) {
            ;(sphere.material as Material & { flatShading: boolean }).flatShading = false
          }
          addObjectToGroup(entity, sphere)
          setComponent(entity, MeshComponent, sphere)
          materialLoaded.set(true)
        }
      })
    } else if (fileType === 'lookDev') {
      setComponent(entity, GLTFComponent, { src, cameraOcclusion: false })

      if (skyboxLoaded.value) {
        skyboxLoaded.set(false)
      }

      //addMediaNode(src, skyboxEntity)

      const reactor = startReactor(() => {
        const gltfComponent = useOptionalComponent(entity, GLTFComponent)
        const gltfState = useMutableState(GLTFDocumentState)
        const sceneId = GLTFComponent.useInstanceID(entity)
        const gltfLoaded = GLTFComponent.useSceneLoaded(entity)

        useEffect(() => {
          if (!gltfState[sceneId].value || !gltfLoaded) {
            return
          }

          const skyboxEntities = getChildrenWithComponents(entity, [SkyboxComponent])

          const componentJson = gltfComponent.scene.value.children[0].userData.componentJson
          componentJson.forEach((component) => {
            if (component.name == SkyboxComponent.jsonID) {
              setComponent(skyboxEntity, SkyboxComponent, component.props)
              const test = getComponent(skyboxEntity, SkyboxComponent)
              SkyboxComponent.reactorMap.get(skyboxEntity)?.run()

              const subReactor = startReactor(() => {
                const backgroundComponent = useOptionalComponent(skyboxEntity, BackgroundComponent)

                useEffect(() => {
                  if (!backgroundComponent?.value) {
                    return
                  }
                  const texture = getComponent(skyboxEntity, BackgroundComponent) as Texture
                  skyboxLoaded.set(true)
                  subReactor.stop()
                  reactor.stop()
                }, [backgroundComponent?.value])

                return null
              })
            }
          })

          reactor.stop()
        }, [gltfLoaded, gltfState[sceneId]])

        return null
      })
    }

    if (!state.cameraEntity.value) {
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
      state.thumbnailCanvas.set(thumbnailCanvas)

      const cameraEntity = createEntity()
      setComponent(cameraEntity, CameraComponent)
      setComponent(cameraEntity, RendererComponent, { canvas: thumbnailCanvas })
      initializeEngineRenderer(cameraEntity)
      setComponent(cameraEntity, VisibleComponent, true)
      state.cameraEntity.set(cameraEntity)
    }

    state.modelEntity.set(entity)
    state.lightEntity.set(lightEntity)
    state.skyboxEntity.set(skyboxEntity)
  }, [fileType, id])

  // Render model to canvas
  useEffect(() => {
    if (errorComponent?.keys.includes(ModelComponent.name)) {
      console.error('failed to load model for thumbnail', src)
      jobState.set(jobState.get(NO_PROXY).slice(1))
      return
    }
    if (src === '') return
    if (
      (fileType !== 'model' && fileType !== 'material' && fileType !== 'lookDev') ||
      !state.cameraEntity.value ||
      !state.modelEntity.value ||
      !lightComponent?.light.value
    )
      return

    if (fileType === 'material' && !materialLoaded.value) return
    if (fileType === 'lookDev' && !skyboxLoaded.value) return

    const modelEntity = state.modelEntity.value
    const lightEntity = state.lightEntity.value
    const skyboxEntity = state.skyboxEntity.value

    const sceneID = GLTFComponent.getInstanceID(modelEntity)
    if (!sceneState.value[sceneID]) return

    try {
      const cameraEntity = state.cameraEntity.value
      setCameraFocusOnBox(modelEntity, cameraEntity)
      const camera = getComponent(cameraEntity, CameraComponent)
      const viewCamera = camera.cameras[0]

      viewCamera.layers.mask = getComponent(cameraEntity, ObjectLayerMaskComponent)
      setComponent(cameraEntity, RendererComponent, { scenes: [modelEntity, lightEntity, skyboxEntity] })

      const renderer = getComponent(cameraEntity, RendererComponent)
      const { scene, canvas, scenes } = renderer
      const entitiesToRender = scenes.map(getNestedVisibleChildren).flat()
      const { background, children } = getSceneParameters(entitiesToRender)
      scene.children = children
      scene.background = background
      render(renderer, renderer.scene, getComponent(cameraEntity, CameraComponent), 0, false)
      function cleanup() {
        jobState.set(jobState.get(NO_PROXY).slice(1))
        materialLoaded.set(false)
        skyboxLoaded.set(false)
      }
      canvas!.toBlob((blob: Blob) => {
        try {
          uploadThumbnail(src, project, id, blob).then(cleanup)
        } catch (e) {
          console.error('failed to upload model thumbnail for', src)
          console.error(e)
          cleanup()
        }
      })
    } catch (e) {
      console.error('failed to generate model thumbnail for', src)
      console.error(e)
      jobState.set(jobState.get(NO_PROXY).slice(1))
    }
  }, [
    state.cameraEntity,
    state.modelEntity,
    state.skyboxEntity,
    lightComponent?.light,
    sceneState.keys,
    errorComponent?.keys,
    materialLoaded,
    skyboxLoaded
  ])

  return null
}
