import Hls from 'hls.js'
import {
  AxesHelper,
  BufferGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Quaternion,
  Vector3
} from 'three'

import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { HighlightComponent } from '../../renderer/components/HighlightComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { DesiredTransformComponent } from '../../transform/components/DesiredTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { ObjectFitFunctions } from '../../xrui/functions/ObjectFitFunctions'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractedComponent } from '../components/InteractedComponent'
import { InteractorComponent } from '../components/InteractorComponent'
import { createInteractiveModalView } from '../ui/InteractiveModalView'

const MODEL_SCALE_INACTIVE = new Vector3(1, 1, 1)
const MODEL_SCALE_ACTIVE = new Vector3(1.2, 1.2, 1.2)
const MODEL_ELEVATION_ACTIVE = 0.3

const TITLE_POS_INACTIVE = new Vector3(0, 0.5, 0)
const TITLE_POS_ACTIVE = new Vector3(0, 0.4, 0)

const INTERACTING_UI_POSITION = new Vector3(0, 0, -0.3)
const INTERACTING_CAMERA_ROTATION = new Quaternion()

const ANCHORED_POSITION = new Map<Entity, Vector3>()
const ANCHORED_ROTATION = new Map<Entity, Quaternion>()

const TRANSITION_DURATION = 3

const _vect = new Vector3()
const _quat = new Quaternion()

export function createInteractUI(modelEntity: Entity) {
  const ui = createInteractiveModalView(modelEntity)
  const nameComponent = getComponent(modelEntity, NameComponent)
  addComponent(ui.entity, NameComponent, { name: 'interact-ui-' + nameComponent.name })

  if (!Engine.instance.isEditor) {
    // for some reason, using the transform component creates extremely jittery transitions
    removeComponent(modelEntity, TransformComponent)
  }

  ui.container.then((c) => {
    const modelComp = getComponent(modelEntity, Object3DComponent)

    const modelObj = modelComp.value
    setObjectLayers(modelObj, ObjectLayers.UI)

    const boundingBoxComponent = getComponent(modelEntity, BoundingBoxComponent)
    const centeringGroup = new Group()
    boundingBoxComponent.box.getCenter(centeringGroup.position)

    Engine.instance.scene.add(centeringGroup)
    centeringGroup.attach(modelObj)
    c.position.copy(centeringGroup.position)

    ANCHORED_POSITION.set(modelEntity, centeringGroup.position.clone())
    ANCHORED_ROTATION.set(modelEntity, centeringGroup.quaternion.clone())

    modelComp.value = centeringGroup

    c.rootLayer.traverseLayersPreOrder((layer) => {
      layer.shouldApplyDOMLayout = false
      const mat = layer.contentMesh.material as MeshBasicMaterial
      mat.opacity = 0
    })
  })

  return ui
}

// callback from modal view state
//   interactiveComponent.callback = (data) => {
//     const entityIndex = data.entityIndex
//     const currentUI = InteractiveUI.get(entityIndex)!
//     const xrui = getComponent(currentUI.entity, XRUIComponent)
//     xrui.container.refresh()
//     if (!xrui) return
//     setTimeout(() => {
//       xrui.container.refresh()
//       const mediaIndex = data.mediaIndex
//       const mediaData = data.mediaData
//       const videoLayer = xrui.container.rootLayer.querySelector(`#ui-video-${entityIndex}`)
//       const modelLayer = xrui.container.rootLayer.querySelector(`#ui-model-${entityIndex}`)
//       const videoElement = videoLayer?.element as HTMLMediaElement
//       if (mediaData[mediaIndex]) {
//         // refresh video element
//         if (videoElement) {
//           //TODO: sometimes the video rendering does not work, set resize for refreshing
//           // videoElement.element.style.height = 0
//           if (mediaData[mediaIndex].type == 'video') {
//             const path = mediaData[mediaIndex].path
//             if (isHLS(path)) {
//               const hls = new Hls()
//               hls.loadSource(path)
//               hls.attachMedia(videoElement as HTMLMediaElement)
//             } else {
//               videoElement.src = path
//               videoElement.load()
//             }
//             videoElement.addEventListener(
//               'loadeddata',
//               function () {
//                 // videoElement.style.height = 'auto'
//                 videoElement.play()
//                 xrui.container.refresh()
//               },
//               false
//             )
//           } else {
//             videoElement.pause()
//           }
//         }

//         //refresh model element
//         if (modelLayer) {
//           if (mediaData[mediaIndex].type == 'model') {
//             for (var i = modelLayer.contentMesh.children.length - 1; i >= 0; i--) {
//               modelLayer.contentMesh.remove(modelLayer.contentMesh.children[i])
//             }

//             //load glb file
//             AssetLoader.loadAsync(mediaData[mediaIndex].path).then((model) => {
//               const object3d = new Object3D()
//               model.scene.traverse((mesh) => {
//                 //@ts-ignore
//                 if (mesh.material) {
//                   //@ts-ignore
//                   mesh.material.depthTest = false
//                   //@ts-ignore
//                   mesh.renderOrder = 1
//                   //@ts-ignore
//                   mesh.material.transparent = true
//                 }
//               })

//               const scale = modelLayer.contentMesh.scale
//               model.scene.scale.set(1 / scale.x, 1 / scale.y, 1 / scale.x)

//               object3d.add(model.scene)
//               modelLayer.contentMesh.add(object3d)
//             })
//           } else {
//             for (var i = modelLayer.contentMesh.children.length - 1; i >= 0; i--) {
//               modelLayer.contentMesh.remove(modelLayer.contentMesh.children[i])
//             }
//           }
//         }
//       }
//     }, 500)
//   }
// }

// export const setUserDataInteractUI = (xrEntity: Entity) => {
//   const xrui = getComponent(xrEntity, XRUIComponent) as any
//   if (!xrui || !xrui.layer) return
//   //create text
//   const parentEntity = getParentInteractUI(xrEntity)
//   const interactiveComponent = getComponent(parentEntity, InteractableComponent).value
//   const interactTextEntity = createInteractText(interactiveComponent.interactionText)
//   const object3D = getComponent(xrEntity, Object3DComponent)
//   if (object3D) {
//     object3D.value.userData = {
//       interactTextEntity,
//       parentEntity: parentEntity
//     }
//     hideInteractUI(parentEntity)
//   }
// }

const transitionStartTime = new Map<Entity, number>()

export const updateInteractUI = (modelEntity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
  if (Engine.instance.isEditor) return

  const world = useWorld()
  const uiContainer = getComponent(xrui.entity, XRUIComponent)?.container
  const anchoredPosition = ANCHORED_POSITION.get(modelEntity)!
  const anchoredRotation = ANCHORED_ROTATION.get(modelEntity)!
  const localInteractor = getComponent(world.localClientEntity, InteractorComponent)

  if (!uiContainer || !anchoredPosition || !localInteractor) return

  const modelGroup = getComponent(modelEntity, Object3DComponent).value

  const hasFocus = localInteractor.focusedInteractive === modelEntity
  const interacted = hasComponent(modelEntity, InteractedComponent)

  const currentMode = xrui.state.mode.value
  let nextMode = currentMode

  if (hasFocus) {
    if (nextMode === 'inactive') nextMode = 'active'
    if (interacted) {
      nextMode = currentMode === 'interacting' ? 'active' : 'interacting'
    }
  } else {
    nextMode = 'inactive'
  }

  if (nextMode !== currentMode) {
    transitionStartTime.set(modelEntity, world.elapsedTime)
    xrui.state.mode.set(nextMode)
    if (nextMode === 'interacting') {
      Engine.instance.camera.attach(uiContainer)
    } else {
      Engine.instance.scene.attach(uiContainer)
    }
    modelGroup.traverse((obj) => {
      const mesh = obj as Mesh<BufferGeometry, MeshBasicMaterial>
      if (mesh.material) {
        mesh.material.transparent = nextMode === 'interacting'
        mesh.renderOrder = nextMode === 'interacting' ? 1 : 0
        mesh.material.needsUpdate = true
      }
    })
  }

  const transitionStart = transitionStartTime.get(modelEntity)
  const transitionElapsed = transitionStart ? world.elapsedTime - transitionStart : 0
  const alpha = Math.min(transitionElapsed / TRANSITION_DURATION, 1)

  const root = uiContainer.rootLayer
  const rootMat = root.contentMesh.material as MeshBasicMaterial

  const title = uiContainer.rootLayer.querySelector('.title')!
  const titleMat = title.contentMesh.material as MeshBasicMaterial

  const eKey = uiContainer.rootLayer.querySelector('.hint')!
  const eKeyMat = eKey.contentMesh.material as MeshBasicMaterial

  const description = uiContainer.rootLayer.querySelector('.description')!
  const descriptionMat = description.contentMesh.material as MeshBasicMaterial

  const stars = [
    uiContainer.rootLayer.querySelector('.star-1')!,
    uiContainer.rootLayer.querySelector('.star-2')!,
    uiContainer.rootLayer.querySelector('.star-3')!,
    uiContainer.rootLayer.querySelector('.star-4')!,
    uiContainer.rootLayer.querySelector('.star-5')!
  ]

  const modelContainer = uiContainer.rootLayer.querySelector('.model')!
  modelContainer.position.lerp(modelContainer.domLayout.position, alpha)
  modelContainer.quaternion.slerp(modelContainer.domLayout.quaternion, alpha)
  modelContainer.scale.lerp(modelContainer.domLayout.scale, alpha)

  const link = uiContainer.rootLayer.querySelector('.link')!
  const linkMat = link.contentMesh.material as MeshBasicMaterial

  if (nextMode === 'inactive') {
    const uiContainerScale = Math.max(1, Engine.instance.camera.position.distanceTo(anchoredPosition)) * 0.8
    uiContainer.position.lerp(anchoredPosition, alpha)
    uiContainer.quaternion.slerp(_quat.setFromRotationMatrix(Engine.instance.camera.matrix), alpha)
    uiContainer.scale.lerp(_vect.setScalar(uiContainerScale), alpha)

    if (modelGroup.parent !== Engine.instance.scene) {
      Engine.instance.scene.attach(modelGroup)
    }

    modelGroup.position.lerp(anchoredPosition, alpha)
    modelGroup.quaternion.slerp(anchoredRotation, alpha)
    modelGroup.scale.lerp(MODEL_SCALE_INACTIVE, alpha)

    rootMat.opacity = MathUtils.lerp(rootMat.opacity, 0, alpha)

    title.position.lerp(TITLE_POS_INACTIVE, alpha)
    title.scale.lerp(title.domLayout.scale, alpha)
    titleMat.opacity = MathUtils.lerp(titleMat.opacity, 0, alpha)

    description.position.lerp(description.domLayout.position, alpha)
    descriptionMat.opacity = MathUtils.lerp(descriptionMat.opacity, 0, alpha)

    link.position.lerp(link.domLayout.position, alpha)
    linkMat.opacity = MathUtils.lerp(linkMat.opacity, 0, alpha)

    eKey.position.copy(title.position)
    eKey.position.y -= 0.1
    eKeyMat.opacity = MathUtils.lerp(eKeyMat.opacity, 0, alpha)

    for (const [i, s] of stars.entries()) {
      s.position.lerp(s.domLayout.position, alpha)
      s.scale.lerp(s.domLayout.scale.multiplyScalar(0.1), alpha)
      const mat = s.contentMesh.material as MeshBasicMaterial
      mat.opacity = MathUtils.lerp(mat.opacity, 0, alpha)
    }
  } else if (nextMode === 'active') {
    const uiContainerScale = Math.max(1, Engine.instance.camera.position.distanceTo(anchoredPosition)) * 0.8
    uiContainer.position.lerp(anchoredPosition, alpha)
    uiContainer.quaternion.slerp(_quat.setFromRotationMatrix(Engine.instance.camera.matrix), alpha)
    uiContainer.scale.lerp(_vect.setScalar(uiContainerScale), alpha)

    if (modelGroup.parent !== Engine.instance.scene) {
      Engine.instance.scene.attach(modelGroup)
    }

    const modelTargetPosition = _vect.copy(anchoredPosition)
    modelTargetPosition.y += MODEL_ELEVATION_ACTIVE + Math.sin(world.elapsedTime) * 0.05
    modelGroup.position.lerp(modelTargetPosition, alpha)
    modelGroup.quaternion.slerp(anchoredRotation, alpha)
    modelGroup.scale.lerp(MODEL_SCALE_ACTIVE, alpha)

    rootMat.opacity = MathUtils.lerp(rootMat.opacity, 0, alpha)

    title.position.lerp(TITLE_POS_ACTIVE, alpha)
    title.scale.lerp(title.domLayout.scale, alpha)
    titleMat.opacity = MathUtils.lerp(titleMat.opacity, 1, alpha)

    description.position.lerp(description.domLayout.position, alpha)
    descriptionMat.opacity = MathUtils.lerp(descriptionMat.opacity, 0, alpha)

    link.position.lerp(link.domLayout.position, alpha)
    linkMat.opacity = MathUtils.lerp(linkMat.opacity, 0, alpha)

    eKey.position.copy(title.position)
    eKey.position.y -= 0.1
    eKeyMat.opacity = MathUtils.lerp(eKeyMat.opacity, 1, alpha)

    for (const [i, s] of stars.entries()) {
      s.position.lerp(s.domLayout.position, alpha)
      s.scale.lerp(s.domLayout.scale.multiplyScalar(0.1), alpha)
      const mat = s.contentMesh.material as MeshBasicMaterial
      mat.opacity = MathUtils.lerp(mat.opacity, 0, alpha)
    }
  } else if (nextMode === 'interacting') {
    const uiSize = uiContainer.rootLayer.domSize
    const uiContainerScale =
      ObjectFitFunctions.computeContentFitScaleForCamera(INTERACTING_UI_POSITION.z, uiSize.x, uiSize.y, 'contain') *
      0.85
    uiContainer.position.lerp(INTERACTING_UI_POSITION, alpha)
    uiContainer.quaternion.slerp(INTERACTING_CAMERA_ROTATION, alpha)
    uiContainer.scale.lerp(_vect.setScalar(uiContainerScale), alpha)

    const modelBounds = getComponent(modelEntity, BoundingBoxComponent)
    const modelSize = modelBounds.box.getSize(_vect)
    const modelScale =
      ObjectFitFunctions.computeContentFitScale(
        modelSize.x,
        modelSize.y,
        modelContainer.domSize.x,
        modelContainer.domSize.y,
        'contain'
      ) * 0.5

    if (modelGroup.parent !== modelContainer) {
      modelContainer.attach(modelGroup)
    }

    modelGroup.position.lerp(_vect.setScalar(0), alpha)
    modelGroup.quaternion.slerp(_quat.copy(Engine.instance.camera.quaternion).invert(), alpha)
    modelGroup.scale.lerp(_vect.setScalar(modelScale), alpha)

    rootMat.opacity = MathUtils.lerp(rootMat.opacity, 1, alpha)

    title.position.lerp(title.domLayout.position, alpha)
    title.scale.lerp(title.domLayout.scale, alpha)

    eKey.position.lerp(eKey.domLayout.position, alpha)
    eKeyMat.opacity = MathUtils.lerp(eKeyMat.opacity, 0, alpha)

    description.position.lerp(description.domLayout.position, alpha)
    descriptionMat.opacity = MathUtils.lerp(descriptionMat.opacity, 1, alpha)

    link.position.lerp(link.domLayout.position, alpha)
    linkMat.opacity = MathUtils.lerp(linkMat.opacity, 1, alpha)

    for (const [i, s] of stars.entries()) {
      const alpha = Math.min((transitionElapsed - i * 0.1) / (TRANSITION_DURATION * 3), 1)
      s.position.lerp(s.domLayout.position, alpha)
      s.scale.lerp(s.domLayout.scale, alpha)
      const mat = s.contentMesh.material as MeshBasicMaterial
      mat.opacity = MathUtils.lerp(mat.opacity, 1, alpha)
    }
  }
}

//TODO: Show interactive UI
// export const showInteractUI = (entity: Entity) => {
//   const ui = InteractiveUI.get(entity)
//   if (!ui) return
//   const xrui = getComponent(ui.entity, XRUIComponent) as any
//   if (!xrui) return
//   const object3D = getComponent(ui.entity, Object3DComponent) as any
//   if (!object3D.value || !object3D.value.userData || !object3D.value.userData.interactTextEntity) return

//   const userData = object3D.value.userData

//   //refresh video
//   const videoElement = xrui.layer.querySelector(`#ui-video-${userData.parentEntity}`)
//   if (videoElement && videoElement.element) {
//     //TODO: sometimes the video rendering does not work, set resize for refreshing
//     videoElement.element.style.height = 0
//     if (videoElement.element.style.display == 'block') {
//       videoElement.element.load()
//       videoElement.element.addEventListener(
//         'loadeddata',
//         function () {
//           videoElement.element.style.height = 'auto'
//           videoElement.element.play()
//         },
//         false
//       )
//     } else {
//       videoElement.element.pause()
//     }
//   }

//   object3D.value.visible = true
//   hideInteractText(userData.interactTextEntity)
// }

// //TODO: Hide interactive UI
// export const hideInteractUI = (entity: Entity) => {
//   const ui = InteractiveUI.get(entity)
//   if (!ui) return
//   const xrui = getComponent(ui.entity, XRUIComponent) as any
//   if (!xrui) return

//   const object3D = getComponent(ui.entity, Object3DComponent) as any
//   if (!object3D.value || !object3D.value.userData || !object3D.value.userData.interactTextEntity) return
//   const userData = object3D.value.userData
//   const videoElement = xrui.layer.querySelector(`#ui-video-${userData.parentEntity}`)
//   if (videoElement && videoElement.element && videoElement.element.pause) videoElement.element.pause()

//   object3D.value.visible = false
//   showInteractText(userData.interactTextEntity, entity)
// }

//TODO: Get interactive UI

//TODO: Get interactive UI
// export const getParentInteractUI = (entity: Entity) => {
//   let parentEntity
//   InteractiveUI.forEach((ui) => {
//     if (ui.entity == entity) {
//       parentEntity = ui.state.entityIndex.value
//     }
//   })
//   return parentEntity
// }
