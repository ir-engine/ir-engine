import { Entity } from '../../ecs/classes/Entity'
import { MathUtils, Quaternion, Vector3, Object3D } from 'three'
import { addComponent, getComponent, hasComponent, defineQuery } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { RenderedComponent } from '../../scene/components/RenderedComponent'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'

import { Engine } from '../../ecs/classes/Engine'
import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'

import { hideInteractText, showInteractText, createInteractText } from './interactText'
import { createInteractiveModalView } from '../ui/InteractiveModalView'

import Hls from 'hls.js'
import isHLS from '@xrengine/engine/src/scene/functions/isHLS'

/**
 * @author Ron Oyama <github.com/rondoor124>
 */

const upVec = new Vector3(0, 1, 0)

export const InteactiveUI = new Map<Entity, ReturnType<typeof createInteractiveModalView>>()

//TODO: Create interactive UI
export const createInteractUI = (entity: Entity) => {
  console.log('createInteractUI ', entity)
  const interactiveComponent = getComponent(entity, InteractableComponent)
  if (getInteractUI(entity) || !interactiveComponent || !interactiveComponent.data) return

  //create interactive view
  interactiveComponent.data.interactionUserData = {}
  interactiveComponent.data.interactionUserData.entity = entity
  const ui = createInteractiveModalView(interactiveComponent.data as any)
  InteactiveUI.set(entity, ui)

  //set transform
  const transform = getComponent(entity, TransformComponent)
  addComponent(ui.entity, TransformComponent, {
    position: new Vector3(transform.position.x, transform.position.y + 2.5, transform.position.z),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })

  // callback from modal view state
  interactiveComponent.data.callback = (data) => {
    setTimeout(() => {
      const mediaIndex = data.mediaIndex
      const mediaData = data.mediaData
      const entityIndex = data.entityIndex
      const currentUI = getInteractUI(entityIndex) as any
      const xrComponent = getComponent(currentUI.entity, XRUIComponent) as any
      if (!xrComponent && !xrComponent.layer) return
      const videoElement = xrComponent.layer.querySelector(`#interactive-ui-video-${entityIndex}`)
      const modelElement = xrComponent.layer.querySelector(`#interactive-ui-model-${entityIndex}`)
      if (mediaData[mediaIndex]) {
        // refresh video element
        if (videoElement && videoElement.element) {
          //TODO: sometimes the video rendering does not work, set resize for refreshing
          videoElement.element.style.height = 0
          if (mediaData[mediaIndex].type == 'video') {
            const path = mediaData[mediaIndex].path
            if (isHLS(path)) {
              const hls = new Hls()
              hls.loadSource(path)
              hls.attachMedia(videoElement.element)
            } else {
              videoElement.element.src = path
              videoElement.element.load()
            }
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

        //refresh model element
        if (modelElement) {
          if (mediaData[mediaIndex].type == 'model') {
            for (var i = modelElement.contentMesh.children.length - 1; i >= 0; i--) {
              modelElement.contentMesh.remove(modelElement.contentMesh.children[i])
            }

            //load glb file
            LoadGLTF(mediaData[mediaIndex].path).then((model) => {
              const object3d = new Object3D()
              model.scene.traverse((mesh) => {
                //@ts-ignore
                if (mesh.material) {
                  //@ts-ignore
                  mesh.material.depthTest = false
                  //@ts-ignore
                  mesh.renderOrder = 1
                  //@ts-ignore
                  mesh.material.transparent = true
                }
              })

              const scale = modelElement.contentMesh.scale
              model.scene.scale.set(1 / scale.x, 1 / scale.y, 1 / scale.x)

              object3d.add(model.scene)
              modelElement.contentMesh.add(object3d)
            })
          } else {
            for (var i = modelElement.contentMesh.children.length - 1; i >= 0; i--) {
              modelElement.contentMesh.remove(modelElement.contentMesh.children[i])
            }
          }
        }
      }
    }, 500)
  }
}

export const setUserDataInteractUI = (xrEntity: Entity) => {
  const xrComponent = getComponent(xrEntity, XRUIComponent) as any
  if (!xrComponent && !xrComponent.layer) return
  //create text
  const parentEntity = getParentInteractUI(xrEntity)
  const interactiveComponent = getComponent(parentEntity, InteractableComponent)
  const interactTextEntity = createInteractText(interactiveComponent.data.interactionText)
  const object3D = getComponent(xrEntity, Object3DComponent)
  if (object3D) {
    object3D.value.userData = {
      interactTextEntity,
      parentEntity: parentEntity
    }
    hideInteractUI(parentEntity)
  }
}

export const updateInteractUI = (userEntity: Entity, xrEntity: Entity) => {
  const interactUIObject = getComponent(xrEntity, Object3DComponent).value
  if (!interactUIObject.visible) return
  const xrComponent = getComponent(xrEntity, XRUIComponent) as any
  if (!xrComponent && !xrComponent.layer) return

  const entityIndex = xrComponent.layer.userData.parentEntity
  const modelElement = xrComponent.layer.querySelector(`#interactive-ui-model-${entityIndex}`)
  if (modelElement && modelElement.contentMesh && modelElement.contentMesh.children[0]) {
    modelElement.contentMesh.children[0].rotateY(0.01)
  }
  if (Engine.activeCameraFollowTarget && hasComponent(Engine.activeCameraFollowTarget, FollowCameraComponent)) {
    interactUIObject.children[0].setRotationFromAxisAngle(
      upVec,
      MathUtils.degToRad(getComponent(Engine.activeCameraFollowTarget, FollowCameraComponent).theta)
    )
  } else {
    const { x, z } = getComponent(userEntity, TransformComponent).position
    interactUIObject.lookAt(x, interactUIObject.position.y, z)
  }
}

//TODO: Show interactive UI
export const showInteractUI = (entity: Entity) => {
  const ui = getInteractUI(entity)
  if (!ui) return
  const xrComponent = getComponent(ui.entity, XRUIComponent) as any
  if (!xrComponent && !xrComponent.layer) return
  const object3D = getComponent(ui.entity, Object3DComponent) as any
  if (!object3D.value || !object3D.value.userData || !object3D.value.userData.interactTextEntity) return

  const userData = object3D.value.userData

  //refresh video
  const videoElement = xrComponent.layer.querySelector(`#interactive-ui-video-${userData.parentEntity}`)
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
  const ui = getInteractUI(entity)
  if (!ui) return
  const xrComponent = getComponent(ui.entity, XRUIComponent) as any
  if (!xrComponent && !xrComponent.layer) return

  const object3D = getComponent(ui.entity, Object3DComponent) as any
  if (!object3D.value || !object3D.value.userData || !object3D.value.userData.interactTextEntity) return
  const userData = object3D.value.userData
  const videoElement = xrComponent.layer.querySelector(`#interactive-ui-video-${userData.parentEntity}`)
  if (videoElement && videoElement.element && videoElement.element.pause) videoElement.element.pause()

  object3D.value.visible = false
  showInteractText(userData.interactTextEntity, entity)
}

//TODO: Get interactive UI
export const getInteractUI = (entity: Entity) => {
  let ui = InteactiveUI.get(entity)
  if (ui) return ui
  return false
}

//TODO: Get interactive UI
export const getParentInteractUI = (entity: Entity) => {
  let parentEntity
  InteactiveUI.forEach((ui) => {
    if (ui.entity == entity) {
      parentEntity = ui.state.entityIndex.value
    }
  })
  return parentEntity
}
