import { Entity } from '../../ecs/classes/Entity'
import { Group, MathUtils, Mesh, MeshPhongMaterial, Quaternion, Vector3, Box3 } from 'three'
import { addComponent, getComponent, hasComponent, defineQuery } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { UpdatableComponent } from '../../scene/components/UpdatableComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { RenderedComponent } from '../../scene/components/RenderedComponent'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'

import { Engine } from '../../ecs/classes/Engine'
import UpdateableObject3D from '../../scene/classes/UpdateableObject3D'
import { removeEntity, createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'

import { hideInteractText, showInteractText, createInteractText } from './interactText'
import { createInteractiveModalView, connectCallback } from '../ui/InteractiveModalView'
/**
 * @author Ron Oyama <github.com/rondoor124>
 */

const upVec = new Vector3(0, 1, 0)
const localUserQuery = defineQuery([LocalInputTagComponent, AvatarComponent])
const xrUIQuery = defineQuery([XRUIComponent, Object3DComponent])
let interactModelEntity: any

export const InteactiveUI = new Map<Entity, ReturnType<typeof createInteractiveModalView>>()

//TODO: Create interactive UI
export const createInteractUI = (entity: Entity) => {
  const interactiveComponent = getComponent(entity, InteractableComponent)
  if (getInteractUI(entity) || !interactiveComponent || !interactiveComponent.data) return

  //create interactive view
  interactiveComponent.data.interactionUserData = {}
  interactiveComponent.data.interactionUserData.entity = entity
  const ui = createInteractiveModalView(interactiveComponent.data)
  InteactiveUI.set(entity, ui)

  //set transform
  const transform = getComponent(entity, TransformComponent)
  addComponent(ui.entity, TransformComponent, {
    position: new Vector3(transform.position.x, transform.position.y + 2.5, transform.position.z),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })

  //create text
  const interactTextEntity = createInteractText(interactiveComponent.data.interactionText)

  //rendered for model rotation
  addComponent(ui.entity, RenderedComponent, {})
  const updateableObject = new UpdateableObject3D()
  addComponent(ui.entity, UpdatableComponent, { value: updateableObject })

  updateableObject.userData = {
    interactTextEntity,
    parentEntity: entity
  }

  const timer = setInterval(() => {
    const object3D = getComponent(ui.entity, Object3DComponent)
    if (object3D) {
      hideInteractUI(entity)
      clearInterval(timer)
    }
  }, 100)

  // callback from modal view state
  connectCallback((data) => {
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

        //refresh model element
        if (modelElement) {
          if (mediaData[mediaIndex].type == 'model') {
            //remove past entity
            if (interactModelEntity) {
              removeEntity(interactModelEntity)
              interactModelEntity = undefined
              for (var i = modelElement.contentMesh.children.length - 1; i >= 0; i--) {
                modelElement.contentMesh.remove(modelElement.contentMesh.children[i])
              }
            }

            //load glb file
            LoadGLTF(mediaData[mediaIndex].path).then((model) => {
              const updateableObject = new UpdateableObject3D()

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
              updateableObject.scale.set(1 / scale.x, 1 / scale.y, 1 / scale.x)

              updateableObject.add(model.scene)
              modelElement.contentMesh.add(updateableObject)
              interactModelEntity = createEntity()
              addComponent(interactModelEntity, RenderedComponent, {})
              addComponent(interactModelEntity, UpdatableComponent, { value: updateableObject })
              updateableObject.update = () => {
                updateableObject.rotateY(0.01)
              }
            })
          } else {
            //remove past entity
            if (interactModelEntity) {
              removeEntity(interactModelEntity)
              interactModelEntity = undefined
              for (var i = modelElement.contentMesh.children.length - 1; i >= 0; i--) {
                modelElement.contentMesh.remove(modelElement.contentMesh.children[i])
              }
            }
          }
        }
      }
    }, 500)
  })
}

//TODO: Show interactive UI
export const showInteractUI = (entity: Entity) => {
  const ui = getInteractUI(entity)
  if (!ui) return
  const xrComponent = getComponent(ui.entity, XRUIComponent) as any
  if (!xrComponent && !xrComponent.layer) return
  const updateableObject = getComponent(ui.entity, UpdatableComponent) as any
  if (
    !updateableObject.value ||
    !updateableObject.value.userData ||
    !updateableObject.value.userData.interactTextEntity
  )
    return
  const userData = updateableObject.value.userData

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

  const { value } = getComponent(ui.entity, Object3DComponent)
  value.visible = true

  //rotate UI by camera rotation
  const updateableComponent = getComponent(ui.entity, UpdatableComponent)
  if (updateableComponent && updateableComponent.value) {
    //@ts-ignore
    updateableComponent.value.update = () => {
      for (const entity of localUserQuery()) {
        for (const xrEntity of xrUIQuery()) {
          const interactUIObject = getComponent(xrEntity, Object3DComponent).value
          if (!interactUIObject.visible) continue
          if (Engine.activeCameraFollowTarget && hasComponent(Engine.activeCameraFollowTarget, FollowCameraComponent)) {
            interactUIObject.children[0].setRotationFromAxisAngle(
              upVec,
              MathUtils.degToRad(getComponent(Engine.activeCameraFollowTarget, FollowCameraComponent).theta)
            )
          } else {
            const { x, z } = getComponent(entity, TransformComponent).position
            interactUIObject.lookAt(x, interactUIObject.position.y, z)
          }
        }
      }
    }
  }

  hideInteractText(userData.interactTextEntity)
}

//TODO: Hide interactive UI
export const hideInteractUI = (entity: Entity) => {
  const ui = getInteractUI(entity)
  if (!ui) return
  const xrComponent = getComponent(ui.entity, XRUIComponent) as any
  if (!xrComponent && !xrComponent.layer) return
  const updateableObject = getComponent(ui.entity, UpdatableComponent) as any
  if (
    !updateableObject.value ||
    !updateableObject.value.userData ||
    !updateableObject.value.userData.interactTextEntity
  )
    return
  const userData = updateableObject.value.userData
  const videoElement = xrComponent.layer.querySelector(`#interactive-ui-video-${userData.parentEntity}`)
  if (videoElement && videoElement.element && videoElement.element.pause) videoElement.element.pause()

  const { value } = getComponent(ui.entity, Object3DComponent)
  value.visible = false

  showInteractText(userData.interactTextEntity, entity)
}

//TODO: Get interactive UI
export const getInteractUI = (entity: Entity) => {
  let ui = InteactiveUI.get(entity)
  if (ui) return ui
  return false
}
