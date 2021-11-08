import { Easing, Tween } from '@tweenjs/tween.js'
import { Entity } from '../../ecs/classes/Entity'
import {
  addComponent,
  getComponent,
  hasComponent,
  removeComponent,
  defineQuery
} from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { UpdatableComponent } from '../../scene/components/UpdatableComponent'

import { TransformComponent } from '../../transform/components/TransformComponent'
import { TweenComponent } from '../../transform/components/TweenComponent'
import { BoundingBoxComponent } from '../components/BoundingBoxComponent'

import { createInteractiveModalView, connectCallback } from '../ui/InteractiveModalView'
import { XRUIComponent } from '@xrengine/engine/src/xrui/components/XRUIComponent'
import { InteractableComponent } from '../components/InteractableComponent'
import { Group, MathUtils, Mesh, MeshPhongMaterial, Quaternion, Vector3 } from 'three'
import { hideInteractText, showInteractText, createInteractText } from './interactText'
import { RenderedComponent } from '../../scene/components/RenderedComponent'
import UpdateableObject3D from '../../scene/classes/UpdateableObject3D'
import { LocalInputTagComponent } from '../../input/components/LocalInputTagComponent'
import { AvatarComponent } from '../../avatar/components/AvatarComponent'
import { Engine } from '../../ecs/classes/Engine'
import { FollowCameraComponent } from '../../camera/components/FollowCameraComponent'
import { removeEntity, createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { LoadGLTF } from '@xrengine/engine/src/assets/functions/LoadGLTF'
import { Box3 } from 'three'

const localUserQuery = defineQuery([LocalInputTagComponent, AvatarComponent])
const upVec = new Vector3(0, 1, 0)
let modelEntity
const xrUIQuery = defineQuery([XRUIComponent, Object3DComponent])

export const InteactiveUI = new Map<Entity, ReturnType<typeof createInteractiveModalView>>()
let interactTextEntity: Entity
export const createInteractUI = (entity: Entity) => {
  const interactiveComponent = getComponent(entity, InteractableComponent)
  if (getInteractUI(entity) || !interactiveComponent || !interactiveComponent.data) return
  const ui = createInteractiveModalView(interactiveComponent.data)
  InteactiveUI.set(entity, ui)
  addComponent(ui.entity, TransformComponent, {
    position: new Vector3(0, 2.5, 0),
    rotation: new Quaternion(),
    scale: new Vector3(1, 1, 1)
  })
  interactTextEntity = createInteractText(interactiveComponent.data.interactionText)
  addComponent(ui.entity, RenderedComponent, {})
  const updateable3D = new UpdateableObject3D()
  addComponent(ui.entity, UpdatableComponent, { value: updateable3D })

  connectCallback((data) => {
    const xrComponent = getComponent(ui.entity, XRUIComponent) as any
    if (!xrComponent && !xrComponent.layer) return
    setTimeout(() => {
      const mediaIndex = data.mediaIndex.value
      const totalMedia = data.totalMediaUrls.value
      const videoElem = xrComponent.layer.querySelector('#interactive-ui-video')
      const modelElem = xrComponent.layer.querySelector('#interactive-ui-model')
      if (totalMedia[mediaIndex]) {
        if (videoElem && videoElem.element) {
          //TODO: sometimes the video rendering does not work, set resize for refreshing
          videoElem.element.style.height = 0
          if (totalMedia[mediaIndex].type == 'video') {
            videoElem.element.load()
            videoElem.element.addEventListener(
              'loadeddata',
              function () {
                videoElem.element.style.height = 'auto'
                videoElem.element.play()
              },
              false
            )
          } else {
            videoElem.element.pause()
          }
        }

        if (modelElem) {
          if (totalMedia[mediaIndex].type == 'model') {
            console.log(modelEntity)
            if (modelEntity) removeEntity(modelEntity)
            for (var i = modelElem.contentMesh.children.length - 1; i >= 0; i--) {
              modelElem.contentMesh.remove(modelElem.contentMesh.children[i])
            }

            // modelElem.contentMesh
            LoadGLTF(totalMedia[mediaIndex].path).then((model) => {
              const updateable3D = new UpdateableObject3D()
              updateable3D.scale.set(1 / modelElem.contentMesh.scale.x, 1 / modelElem.contentMesh.scale.y, 0.5)
              updateable3D.add(model.scene)
              modelElem.contentMesh.add(updateable3D)
              modelEntity = createEntity()
              addComponent(modelEntity, RenderedComponent, {})
              addComponent(modelEntity, UpdatableComponent, { value: updateable3D })
              updateable3D.update = () => {
                updateable3D.rotateY(0.01)
              }
              const box = new Box3()
              box.setFromObject(modelElem.contentMesh)
              const aabb = new Box3()
              aabb.setFromObject(updateable3D)
              const rate = Math.max(box.min.x, box.min.y, box.min.z) / Math.max(aabb.min.x, aabb.min.y, aabb.min.z)
              updateable3D.scale.addScalar(rate * 0.5)
              updateable3D.position.set(0, -(aabb.max.y - aabb.min.y) * rate * 0.5, aabb.max.z)
            })
          } else {
            if (modelEntity) removeEntity(modelEntity)
            for (var i = modelElem.contentMesh.children.length - 1; i >= 0; i--) {
              modelElem.contentMesh.remove(modelElem.contentMesh.children[i])
            }
          }
        }
      }
    }, 500)
  })
}

export const showInteractUI = (entity: Entity) => {
  const ui = getInteractUI(entity)
  if (!ui) return
  const xrComponent = getComponent(ui.entity, XRUIComponent) as any
  if (!xrComponent && !xrComponent.layer) return
  const videoElem = xrComponent.layer.querySelector('#interactive-ui-video')
  if (videoElem && videoElem.element) {
    //TODO: sometimes the video rendering does not work, set resize for refreshing
    const height = videoElem.element.style.height
    videoElem.element.style.height = 0
    if (videoElem.element.style.display == 'block') {
      videoElem.element.load()
      videoElem.element.play()
    } else {
      videoElem.element.pause()
    }
    videoElem.element.style.height = height
  }
  const { value } = getComponent(ui.entity, Object3DComponent)
  value.visible = true

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

  hideInteractText(interactTextEntity)
}

export const hideInteractUI = (entity: Entity) => {
  const ui = getInteractUI(entity)
  if (!ui) return
  const { value } = getComponent(ui.entity, Object3DComponent)
  const xrComponent = getComponent(ui.entity, XRUIComponent) as any
  if (!xrComponent && !xrComponent.layer) return
  const videoElem = xrComponent.layer.querySelector('#interactive-ui-video')
  if (videoElem && videoElem.element && videoElem.element.pause) videoElem.element.pause()

  value.visible = false

  showInteractText(interactTextEntity, entity)
}

export const getInteractUI = (entity: Entity) => {
  let ui = InteactiveUI.get(entity)
  if (ui) return ui
  return false
}
