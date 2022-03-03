import Hls from 'hls.js'
import { AxesHelper, MathUtils, MeshBasicMaterial, Object3D, Quaternion, Vector3 } from 'three'

import isHLS from '@xrengine/engine/src/scene/functions/isHLS'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { useWorld } from '../../ecs/functions/SystemHooks'
import { NameComponent } from '../../scene/components/NameComponent'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/setObjectLayers'
import { DesiredTransformComponent } from '../../transform/components/DesiredTransformComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { computeContentScaleForCamera } from '../../xrui/functions/computeContentScaleForCamera'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { InteractedComponent } from '../components/InteractedComponent'
import { InteractiveFocusedComponent } from '../components/InteractiveFocusedComponent'
import { InteractiveUI } from '../systems/InteractiveSystem'
import { createInteractiveModalView } from '../ui/InteractiveModalView'
import { hideInteractText, showInteractText } from './interactText'

const MODEL_SCALE_INACTIVE = new Vector3(1, 1, 1)
const MODEL_SCALE_ACTIVE = new Vector3(1.2, 1.2, 1.2)
const MODEL_ELEVATION_ACTIVE = 0.3

const TITLE_POS_INACTIVE = new Vector3(0, 0.5, 0)
const TITLE_POS_ACTIVE = new Vector3(0, 0.4, 0)

const INTERACTING_CAMERA_POSITION = new Vector3(0, 0, -2)
const INTERACTING_CAMERA_ROTATION = new Quaternion()

const ANCHORED_POSITION = new Map<Entity, Vector3>()
const ANCHORED_ROTATION = new Map<Entity, Quaternion>()

const scratchVector = new Vector3()
const invCameraRotation = new Quaternion()

export function createInteractUI(modelEntity: Entity) {
  const ui = createInteractiveModalView(modelEntity)
  const nameComponent = getComponent(modelEntity, NameComponent)
  addComponent(ui.entity, NameComponent, { name: 'interact-ui-' + nameComponent.name })

  const transform = getComponent(modelEntity, TransformComponent)

  // addComponent(ui.entity, TransformComponent, {
  //   position: transform.position.clone(),
  //   rotation: transform.rotation.clone(),
  //   scale: new Vector3(1, 1, 1)
  // })

  if (!Engine.isEditor) {
    addComponent(modelEntity, DesiredTransformComponent, {
      position: transform.position.clone(),
      rotation: transform.rotation.clone(),
      positionRate: 2,
      rotationRate: 1,
      lockRotationAxis: [false, false, false]
    })
  }

  ui.container.then((c) => {
    const modelObj = getComponent(modelEntity, Object3DComponent).value
    setObjectLayers(modelObj, ObjectLayers.UI)
    const boundingBoxComponent = getComponent(modelEntity, BoundingBoxComponent)
    const pos = boundingBoxComponent.box.getCenter(new Vector3())
    ANCHORED_POSITION.set(modelEntity, pos)
    ANCHORED_ROTATION.set(modelEntity, modelObj.quaternion)
    c.position.copy(pos)

    c.rootLayer.traverseLayersPreOrder((layer) => {
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
//       const videoLayer = xrui.container.rootLayer.querySelector(`#interactive-ui-video-${entityIndex}`)
//       const modelLayer = xrui.container.rootLayer.querySelector(`#interactive-ui-model-${entityIndex}`)
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

export const updateInteractUI = (modelEntity: Entity, xrui: ReturnType<typeof createInteractUI>) => {
  if (Engine.isEditor) return

  const container = getComponent(xrui.entity, XRUIComponent)?.container
  const anchoredPosition = ANCHORED_POSITION.get(modelEntity)!
  const anchoredRotation = ANCHORED_ROTATION.get(modelEntity)!

  if (!container || !anchoredPosition) return

  const modelMesh = getComponent(modelEntity, Object3DComponent).value
  const modelDesiredTranform = getComponent(modelEntity, DesiredTransformComponent)
  const modelTransform = getComponent(modelEntity, TransformComponent)

  const world = useWorld()
  const hasFocus = hasComponent(modelEntity, InteractiveFocusedComponent)
  const interacted = hasComponent(modelEntity, InteractedComponent)

  const currentMode = xrui.state.mode.value
  let nextMode = currentMode

  if (currentMode === 'interacting' || interacted) {
    if (interacted) {
      nextMode = currentMode === 'interacting' ? 'active' : 'interacting'
    } else {
      const localPosition = getComponent(world.localClientEntity, TransformComponent)?.position
      const interactable = getComponent(modelEntity, InteractableComponent)
      const dismissDistance = (interactable.interactionDistance.value || 2) * 2
      if (localPosition) {
        if (anchoredPosition.distanceTo(localPosition) > dismissDistance) {
          nextMode = 'active'
        }
      }
    }
  } else if (hasFocus) {
    nextMode = 'active'
  } else {
    nextMode = 'inactive'
  }

  if (nextMode !== currentMode) {
    xrui.state.mode.set(nextMode)
    if (nextMode === 'interacting') {
      Engine.camera.attach(container)
    } else {
      Engine.scene.attach(container)
    }
  }

  const root = container.rootLayer
  const rootMat = root.contentMesh.material as MeshBasicMaterial
  const alpha = world.delta

  const title = container.rootLayer.querySelector('.interactive-title')!
  title.shouldApplyDOMLayout = false
  const titleMat = title.contentMesh.material as MeshBasicMaterial

  const eKey = container.rootLayer.querySelector('.interactive-e-key')!
  eKey.shouldApplyDOMLayout = false
  const eKeyMat = eKey.contentMesh.material as MeshBasicMaterial

  const description = container.rootLayer.querySelector('.interactive-description')!
  description.shouldApplyDOMLayout = false
  const descriptionMat = description.contentMesh.material as MeshBasicMaterial

  const model = container.rootLayer.querySelector('.interactive-model')!

  if (nextMode === 'inactive') {
    if (modelMesh.parent !== Engine.scene) {
      Engine.scene.attach(modelMesh)
      modelTransform.position.copy(modelMesh.position)
      modelTransform.rotation.copy(modelMesh.quaternion)
    }

    modelDesiredTranform.position.copy(anchoredPosition)
    modelDesiredTranform.position.y = anchoredPosition.y
    modelDesiredTranform.rotation.copy(anchoredRotation)
    modelTransform.scale.lerp(MODEL_SCALE_INACTIVE, alpha)

    container.position.lerp(anchoredPosition, alpha)
    container.rotation.setFromRotationMatrix(Engine.camera.matrix)
    const targetScale = Math.max(1, Engine.camera.position.distanceTo(anchoredPosition)) * 0.8
    container.scale.lerp(scratchVector.setScalar(targetScale), alpha)

    rootMat.opacity = MathUtils.lerp(rootMat.opacity, 0, alpha * 3)

    title.position.lerp(TITLE_POS_INACTIVE, alpha)
    titleMat.opacity = MathUtils.lerp(titleMat.opacity, 0, alpha * 3)

    description.position.lerp(description.domLayout.position, alpha)
    descriptionMat.opacity = MathUtils.lerp(descriptionMat.opacity, 0, alpha * 3)

    eKey.position.copy(title.position)
    eKey.position.y -= 0.1
    eKeyMat.opacity = MathUtils.lerp(eKeyMat.opacity, 0, alpha * 3)
  } else if (nextMode === 'active') {
    if (modelMesh.parent !== Engine.scene) {
      Engine.scene.attach(modelMesh)
      modelTransform.position.copy(modelMesh.position)
      modelTransform.rotation.copy(modelMesh.quaternion)
    }

    modelDesiredTranform.position.copy(anchoredPosition)
    modelDesiredTranform.position.y = anchoredPosition.y + MODEL_ELEVATION_ACTIVE + Math.sin(world.elapsedTime) * 0.05
    modelDesiredTranform.rotation.copy(anchoredRotation)
    modelTransform.scale.lerp(MODEL_SCALE_ACTIVE, alpha)

    container.position.lerp(anchoredPosition, alpha)
    container.rotation.setFromRotationMatrix(Engine.camera.matrix)
    const targetScale = Math.max(1, Engine.camera.position.distanceTo(anchoredPosition)) * 0.8
    container.scale.lerp(scratchVector.setScalar(targetScale), alpha)

    rootMat.opacity = MathUtils.lerp(rootMat.opacity, 0, alpha * 3)

    title.position.lerp(TITLE_POS_ACTIVE, alpha)
    titleMat.opacity = MathUtils.lerp(titleMat.opacity, 1, alpha * 3)

    description.position.lerp(description.domLayout.position, alpha)
    descriptionMat.opacity = MathUtils.lerp(descriptionMat.opacity, 0, alpha * 3)

    eKey.position.copy(title.position)
    eKey.position.y -= 0.1
    eKeyMat.opacity = MathUtils.lerp(eKeyMat.opacity, 1, alpha * 3)
  } else if (nextMode === 'interacting') {
    const dist = INTERACTING_CAMERA_POSITION.z
    const size = container.rootLayer.domSize
    const containerScale = computeContentScaleForCamera(dist, size.x, size.y, 'contain') * 0.92

    const modelTransform = getComponent(modelEntity, TransformComponent)
    const modelBounds = getComponent(modelEntity, BoundingBoxComponent)
    const modelSize = modelBounds.box.getSize(scratchVector)
    const modelScale = computeContentScaleForCamera(dist / 2, modelSize.x, modelSize.y, 'contain') * 0.1

    container.position.lerp(INTERACTING_CAMERA_POSITION, alpha)
    container.quaternion.copy(INTERACTING_CAMERA_ROTATION)
    container.scale.lerp(scratchVector.setScalar(containerScale), alpha * 1.2)

    if (modelMesh.parent !== model) {
      model.attach(modelMesh)
      modelTransform.position.copy(modelMesh.position)
      modelTransform.rotation.copy(modelMesh.quaternion)
    }

    invCameraRotation.copy(Engine.camera.quaternion).invert()

    modelDesiredTranform.position.copy(model.domLayout.position)
    modelDesiredTranform.position.x = -0.2
    modelDesiredTranform.position.multiplyScalar(modelScale)
    modelDesiredTranform.position.z = Math.abs(dist * 0.1)
    modelDesiredTranform.rotation.copy(invCameraRotation)
    modelTransform.scale.lerp(scratchVector.setScalar(modelScale), alpha * 1.2)

    rootMat.opacity = MathUtils.lerp(rootMat.opacity, 1, alpha * 3)

    title.position.lerp(title.domLayout.position, alpha)
    eKey.position.lerp(eKey.domLayout.position, alpha)
    eKeyMat.opacity = MathUtils.lerp(eKeyMat.opacity, 0, alpha * 3)

    description.position.lerp(description.domLayout.position, alpha)
    descriptionMat.opacity = MathUtils.lerp(descriptionMat.opacity, 1, alpha * 3)

    modelMesh.scale.lerp(MODEL_SCALE_INACTIVE, alpha)
  }

  // const modelElement = xrui.layer.querySelector(`#interactive-ui-model-${entityIndex}`)
  // if (modelElement && modelElement.contentMesh && modelElement.contentMesh.children[0]) {
  //   modelElement.contentMesh.children[0].rotateY(0.01)
  // }
  // if (Engine.activeCameraFollowTarget && hasComponent(Engine.activeCameraFollowTarget, FollowCameraComponent)) {
  //   interactUIObject.children[0].setRotationFromAxisAngle(
  //     upVec,
  //     MathUtils.degToRad(getComponent(Engine.activeCameraFollowTarget, FollowCameraComponent).theta)
  //   )
  // } else {
  //   const world = useWorld()
  //   const { x, z } = getComponent(world.localClientEntity, TransformComponent).position
  //   interactUIObject.lookAt(x, interactUIObject.position.y, z)
  // }
}

//TODO: Show interactive UI
export const showInteractUI = (entity: Entity) => {
  const ui = InteractiveUI.get(entity)
  if (!ui) return
  const xrui = getComponent(ui.entity, XRUIComponent) as any
  if (!xrui) return
  const object3D = getComponent(ui.entity, Object3DComponent) as any
  if (!object3D.value || !object3D.value.userData || !object3D.value.userData.interactTextEntity) return

  const userData = object3D.value.userData

  //refresh video
  const videoElement = xrui.layer.querySelector(`#interactive-ui-video-${userData.parentEntity}`)
  if (videoElement && videoElement.element) {
    //TODO: sometimes the video rendering does not work, set resize for refreshing
    videoElement.element.style.height = 0
    if (videoElement.element.style.display == 'block') {
      videoElement.element.load()
      videoElement.element.addEventListener(
        'loadeddata',
        function () {
          videoElement.element.style.height = 'auto'
          videoElement.element.play()
        },
        false
      )
    } else {
      videoElement.element.pause()
    }
  }

  object3D.value.visible = true
  hideInteractText(userData.interactTextEntity)
}

//TODO: Hide interactive UI
export const hideInteractUI = (entity: Entity) => {
  const ui = InteractiveUI.get(entity)
  if (!ui) return
  const xrui = getComponent(ui.entity, XRUIComponent) as any
  if (!xrui) return

  const object3D = getComponent(ui.entity, Object3DComponent) as any
  if (!object3D.value || !object3D.value.userData || !object3D.value.userData.interactTextEntity) return
  const userData = object3D.value.userData
  const videoElement = xrui.layer.querySelector(`#interactive-ui-video-${userData.parentEntity}`)
  if (videoElement && videoElement.element && videoElement.element.pause) videoElement.element.pause()

  object3D.value.visible = false
  showInteractText(userData.interactTextEntity, entity)
}

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
