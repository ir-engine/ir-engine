/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import {
  defineComponent,
  getComponent,
  removeComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'

import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/EngineFunctions'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { useExecute } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { addObjectToGroup } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import {
  TransformAxis,
  TransformAxisType,
  TransformMode,
  TransformModeType,
  TransformSpace,
  TransformSpaceType
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import { setObjectLayers } from '@etherealengine/engine/src/scene/functions/setObjectLayers'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { useEffect } from 'react'
import {
  BoxGeometry,
  BufferGeometry,
  CylinderGeometry,
  DoubleSide,
  Euler,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Material,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  OctahedronGeometry,
  PlaneGeometry,
  Quaternion,
  Raycaster,
  SphereGeometry,
  TorusGeometry,
  Vector3
} from 'three'

const _raycaster = new Raycaster()
_raycaster.layers.set(ObjectLayers.TransformGizmo)

const _tempVector = new Vector3()
const _tempVector2 = new Vector3()
const _tempQuaternion = new Quaternion()
const worldPositionStart = new Vector3()
const worldQuaternionStart = new Quaternion()
const rotationAxis = new Vector3()
const eye = new Vector3()
const _unit = {
  X: new Vector3(1, 0, 0),
  Y: new Vector3(0, 1, 0),
  Z: new Vector3(0, 0, 1)
}

export const TransformGizmoControlComponent = defineComponent({
  name: 'TransformGizmoControlComponent',

  onInit(entity) {
    return {
      entity: UndefinedEntity,
      enabled: true,
      axis: null! as TransformAxisType,
      transformMode: TransformMode.translate as TransformModeType,
      transformSpace: TransformSpace.world as TransformSpaceType,
      translationSnap: 0.5,
      rotationSnap: 10,
      scaleSnap: 0.1,
      size: 1,
      dragging: false,
      showX: true,
      showY: true,
      showZ: true,
      eye: null! as Vector3
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.entity === 'number') component.entity.set(json.entity)
    if (typeof json.enabled === 'boolean') component.enabled.set(json.enabled)
    if (typeof json.axis === typeof TransformAxis) component.axis.set(json.axis!)
    if (typeof json.transformMode === typeof TransformMode) component.transformMode.set(json.transformMode!)
    if (typeof json.transformSpace === typeof TransformSpace) component.transformSpace.set(json.transformSpace!)
    if (typeof json.translationSnap === 'number') component.translationSnap.set(json.translationSnap)
    if (typeof json.rotationSnap === 'number') component.rotationSnap.set(json.rotationSnap)
    if (typeof json.scaleSnap === 'number') component.scaleSnap.set(json.scaleSnap)
    if (typeof json.size === 'number') component.size.set(json.size)
    if (typeof json.dragging === 'boolean') component.dragging.set(json.dragging)
    if (typeof json.showX === 'boolean') component.showX.set(json.showX)
    if (typeof json.showY === 'boolean') component.showY.set(json.showY)
    if (typeof json.showZ === 'boolean') component.showZ.set(json.showZ)
  },
  onRemove: (entity, component) => {
    // remove all child geometry
    component.entity.set(UndefinedEntity)
    component.axis.set(null)
  },

  reactor: function (props) {
    const entity = useEntityContext() // the dummy entity
    const gizmoControls = useComponent(entity, TransformGizmoControlComponent)
    const gizmoVisual = useComponent(entity, TransformGizmoVisualComponent)
    const gizmoPlane = useComponent(entity, TransformGizmoPlaneComponent)

    const domElement = EngineRenderer.instance.renderer.domElement
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)

    const parent = useComponent(gizmoControls.entity.value, EntityTreeComponent)
    const parentTransform = useOptionalComponent(parent.parentEntity.value!, TransformComponent)
    const currentTransform = useComponent(gizmoControls.entity.value, TransformComponent)

    const pointStart = new Vector3()
    const pointEnd = new Vector3()
    let rotationAngle = 0
    const _offset = new Vector3()
    const _startNorm = new Vector3()
    const _endNorm = new Vector3()

    const _worldScaleStart = new Vector3()
    const _worldQuaternionInv = new Quaternion()

    const _positionStart = new Vector3()
    const _quaternionStart = new Quaternion()
    const _scaleStart = new Vector3()

    const _plane = gizmoPlane.value

    function updateMatrixWorld() {
      if (gizmoControls.value.entity !== UndefinedEntity) {
        if (!gizmoControls.value.entity) console.error('TransformControls: No entooty selected')
        if (!parent.parentEntity.value) return
        _worldQuaternionInv.copy(currentTransform.rotation.value).invert()
      }
      //camera.updateMatrixWorld()
      /*if (camera.isOrthographicCamera) {
        camera.getWorldDirection(eye).negate()
      } else {*/
      eye.copy(camera.position).sub(currentTransform.position.value).normalize()
      //}
    }

    function getPointer(event) {
      if (domElement.ownerDocument.pointerLockElement) {
        return {
          x: 0,
          y: 0,
          button: event.button
        }
      } else {
        const rect = domElement.getBoundingClientRect()

        return {
          x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
          y: (-(event.clientY - rect.top) / rect.height) * 2 + 1,
          button: event.button
        }
      }
    }

    function onPointerHover(event) {
      if (!gizmoControls.enabled.value) return

      switch (event.pointerType) {
        case 'mouse':
        case 'pen':
          pointerHover(getPointer(event))
          break
      }
    }

    function onPointerDown(event) {
      if (!gizmoControls.enabled.value) return

      if (!document.pointerLockElement) {
        domElement.setPointerCapture(event.pointerId)
      }

      domElement.addEventListener('pointermove', onPointerMove)

      pointerHover(getPointer(event))
      pointerDown(getPointer(event))
    }

    function onPointerMove(event) {
      if (!gizmoControls.enabled.value) return

      pointerMove(getPointer(event))
    }

    function onPointerUp(event) {
      if (!gizmoControls.enabled.value) return

      domElement.releasePointerCapture(event.pointerId)

      domElement.removeEventListener('pointermove', onPointerMove)

      pointerUp(getPointer(event))
    }

    function pointerHover(pointer) {
      if (gizmoControls.value.entity !== UndefinedEntity || gizmoControls.value.dragging === true) return

      _raycaster.setFromCamera(pointer, camera)

      const intersect = intersectObjectWithRay(
        gizmoVisual.value.picker![gizmoControls.value.transformMode],
        _raycaster,
        true
      )

      if (intersect) {
        gizmoControls.axis.set(intersect.object.name)
      } else {
        gizmoControls.axis.set(null as any)
      }
    }

    function pointerDown(pointer) {
      if (
        gizmoControls.value.entity !== UndefinedEntity ||
        gizmoControls.value.dragging === true ||
        pointer.button !== 0
      )
        return

      if (gizmoControls.value.axis !== null) {
        _raycaster.setFromCamera(pointer, camera)

        const planeIntersect = intersectObjectWithRay(_plane, _raycaster, true)

        if (planeIntersect) {
          // modify to utilize transform component instead

          //gizmoControlComponent.value.entity.updateMatrixWorld()
          //gizmoControlComponent.value.object.parent!.updateMatrixWorld()
          _positionStart.copy(currentTransform.value.position)
          _quaternionStart.copy(currentTransform.value.rotation)
          _scaleStart.copy(currentTransform.value.scale)

          currentTransform.value.matrix.decompose(worldPositionStart, worldQuaternionStart, _worldScaleStart)

          pointStart.copy(planeIntersect.point).sub(worldPositionStart)
        }

        gizmoControls.dragging.set(true)
        //;(_mouseDownEvent as any).transformMode = transformMode
        //dispatchEvent(_mouseDownEvent as any)
      }
    }

    function pointerMove(pointer) {
      const axis = gizmoControls.value.axis
      const transformMode = gizmoControls.value.transformMode
      const entity = gizmoControls.value.entity
      let space = gizmoControls.value.transformSpace

      if (transformMode === TransformMode.scale) {
        space = TransformSpace.local
      } else if (axis === TransformAxis.E || axis === TransformAxis.XYZE || axis === TransformAxis.XYZ) {
        space = TransformSpace.world
      }
      // check if entity is valid
      if (entity !== null || axis === null || gizmoControls.value.dragging === false || pointer.button !== -1) return

      _raycaster.setFromCamera(pointer, camera)

      const planeIntersect = intersectObjectWithRay(_plane, _raycaster, true)

      if (!planeIntersect) return

      pointEnd.copy(planeIntersect.point).sub(worldPositionStart)

      if (transformMode === TransformMode.translate) {
        // Apply translate

        _offset.copy(pointEnd).sub(pointStart)

        if (space === TransformSpace.local && axis !== TransformAxis.XYZ) {
          _offset.applyQuaternion(_worldQuaternionInv)
        }

        if (axis !== TransformAxis.X) _offset.x = 0
        if (axis !== TransformAxis.X) _offset.y = 0
        if (axis !== TransformAxis.Z) _offset.z = 0

        if (space === 'local' && axis !== 'XYZ') {
          _offset.applyQuaternion(_quaternionStart).divide(parentTransform!.scale.value)
        } else {
          _offset.applyQuaternion(parentTransform!.value.rotation.invert()).divide(parentTransform!.scale.value)
        }

        // apply to entity instead
        currentTransform.position.set(_offset.add(_positionStart))
        // Apply translation snap

        if (gizmoControls.value.translationSnap) {
          if (space === TransformSpace.local) {
            const newPosition = currentTransform.position.value.applyQuaternion(
              _tempQuaternion.copy(_quaternionStart).invert()
            )
            if ((axis as string).search(TransformAxis.X) !== -1) {
              newPosition.x =
                Math.round(currentTransform.value.position.x / gizmoControls.value.translationSnap) *
                gizmoControls.value.translationSnap
            }

            if ((axis as string).search(TransformAxis.Y) !== -1) {
              newPosition.y =
                Math.round(currentTransform.value.position.y / gizmoControls.value.translationSnap) *
                gizmoControls.value.translationSnap
            }

            if ((axis as string).search(TransformAxis.Z) !== -1) {
              newPosition.z =
                Math.round(currentTransform.value.position.z / gizmoControls.value.translationSnap) *
                gizmoControls.value.translationSnap
            }

            newPosition.applyQuaternion(_quaternionStart)
            currentTransform.position.set(newPosition)
          }

          if (space === TransformSpace.world) {
            if (parent.parentEntity.value) {
              const parentTransform = getComponent(parent.parentEntity.value, TransformComponent)
              parentTransform.position.add(_tempVector.setFromMatrixPosition(parentTransform.matrix))
              setComponent(parent.parentEntity.value, TransformComponent, parentTransform)
            }
            const newPosition = currentTransform.position.value

            if ((axis as string).search(TransformAxis.X) !== -1) {
              newPosition.x =
                Math.round(currentTransform.value.position.x / gizmoControls.value.translationSnap) *
                gizmoControls.value.translationSnap
            }

            if ((axis as string).search(TransformAxis.Y) !== -1) {
              newPosition.y =
                Math.round(currentTransform.value.position.y / gizmoControls.value.translationSnap) *
                gizmoControls.value.translationSnap
            }

            if ((axis as string).search(TransformAxis.Z) !== -1) {
              newPosition.z =
                Math.round(currentTransform.value.position.z / gizmoControls.value.translationSnap) *
                gizmoControls.value.translationSnap
            }
            if (parent.parentEntity.value) {
              const parentTransform = getComponent(parent.parentEntity.value, TransformComponent)
              parentTransform.position.sub(_tempVector.setFromMatrixPosition(parentTransform.matrix))
              setComponent(parent.parentEntity.value, TransformComponent, parentTransform)
            }
          }
        }
      } else if (transformMode === TransformMode.scale) {
        if ((axis as string).search('XYZ') !== -1) {
          let d = pointEnd.length() / pointStart.length()

          if (pointEnd.dot(pointStart) < 0) d *= -1

          _tempVector2.set(d, d, d)
        } else {
          _tempVector.copy(pointStart)
          _tempVector2.copy(pointEnd)

          _tempVector.applyQuaternion(_worldQuaternionInv)
          _tempVector2.applyQuaternion(_worldQuaternionInv)

          _tempVector2.divide(_tempVector)

          if ((axis as string).search(TransformAxis.X) !== -1) {
            _tempVector2.x = 1
          }

          if ((axis as string).search(TransformAxis.Y) !== -1) {
            _tempVector2.y = 1
          }

          if ((axis as string).search(TransformAxis.Z) !== -1) {
            _tempVector2.z = 1
          }
        }

        // Apply scale

        currentTransform.scale.set(_scaleStart.multiply(_tempVector2))

        if (gizmoControls.value.scaleSnap) {
          const newScale = currentTransform.scale.value
          if ((axis as string).search(TransformAxis.X) !== -1) {
            newScale.x =
              Math.round(currentTransform.value.scale.x / gizmoControls.value.scaleSnap) *
                gizmoControls.value.scaleSnap || gizmoControls.value.scaleSnap
          }

          if ((axis as string).search(TransformAxis.Y) !== -1) {
            newScale.y =
              Math.round(currentTransform.value.scale.y / gizmoControls.value.scaleSnap) *
                gizmoControls.value.scaleSnap || gizmoControls.value.scaleSnap
          }

          if ((axis as string).search(TransformAxis.Z) !== -1) {
            newScale.z =
              Math.round(currentTransform.value.scale.z / gizmoControls.value.scaleSnap) *
                gizmoControls.value.scaleSnap || gizmoControls.value.scaleSnap
          }
        }
      } else if (transformMode === TransformMode.rotate) {
        _offset.copy(pointEnd).sub(pointStart)

        const ROTATION_SPEED =
          20 / currentTransform.position.value.distanceTo(_tempVector.setFromMatrixPosition(camera.matrixWorld))

        let _inPlaneRotation = false

        if (axis === TransformAxis.XYZE) {
          rotationAxis.copy(_offset).cross(eye).normalize()
          rotationAngle = _offset.dot(_tempVector.copy(rotationAxis).cross(eye)) * ROTATION_SPEED
        } else if (axis === TransformAxis.X || axis === TransformAxis.Y || axis === TransformAxis.Z) {
          rotationAxis.copy(_unit[axis])

          _tempVector.copy(_unit[axis])

          if (space === TransformSpace.local) {
            _tempVector.applyQuaternion(currentTransform.rotation.value)
          }

          _tempVector.cross(eye)

          // When _tempVector is 0 after cross with eye the vectors are parallel and should use in-plane rotation logic.
          if (_tempVector.length() === 0) {
            _inPlaneRotation = true
          } else {
            rotationAngle = _offset.dot(_tempVector.normalize()) * ROTATION_SPEED
          }
        }

        if (axis === TransformAxis.E || _inPlaneRotation) {
          rotationAxis.copy(eye)
          rotationAngle = pointEnd.angleTo(pointStart)

          _startNorm.copy(pointStart).normalize()
          _endNorm.copy(pointEnd).normalize()

          rotationAngle *= _endNorm.cross(_startNorm).dot(eye) < 0 ? 1 : -1
        }

        // Apply rotation snap

        if (gizmoControls.value.rotationSnap)
          rotationAngle =
            Math.round(rotationAngle / gizmoControls.value.rotationSnap) * gizmoControls.value.rotationSnap

        // Apply rotate
        if (space === TransformSpace.local && axis !== TransformAxis.E && axis !== TransformAxis.XYZE) {
          const newQuaternion = currentTransform.rotation.value
          newQuaternion.copy(_quaternionStart)
          newQuaternion.multiply(_tempQuaternion.setFromAxisAngle(rotationAxis, rotationAngle)).normalize()
          currentTransform.rotation.set(newQuaternion)
        } else {
          rotationAxis.applyQuaternion(parentTransform!.value.rotation.invert())
          const newQuaternion = currentTransform.rotation.value
          newQuaternion.copy(_tempQuaternion.setFromAxisAngle(rotationAxis, rotationAngle))
          newQuaternion.multiply(_quaternionStart).normalize()
          currentTransform.rotation.set(newQuaternion)
        }
      }

      //dispatchEvent(_changeEvent as any)
      //dispatchEvent(_objectChangeEvent as any)
    }

    function pointerUp(pointer) {
      if (pointer.button !== 0) return

      if (gizmoControls.value.dragging && gizmoControls.value.axis !== null) {
        //_mouseUpEvent.transformMode = transformMode
        //dispatchEvent(_mouseUpEvent as any)
      }

      gizmoControls.dragging.set(false)
      gizmoControls.axis.set(null)
    }

    function dispose() {
      // remove all child geometry
    }

    function intersectObjectWithRay(object, raycaster, includeInvisible?) {
      const allIntersections = raycaster.intersectObject(object, true)

      for (let i = 0; i < allIntersections.length; i++) {
        if (allIntersections[i].object.visible || includeInvisible) {
          return allIntersections[i]
        }
      }

      return false
    }

    useEffect(() => {
      console.log('DEBUG adding components')
      setComponent(entity, TransformGizmoVisualComponent)
      setComponent(entity, TransformGizmoPlaneComponent)

      domElement.addEventListener('pointerdown', onPointerDown)
      domElement.addEventListener('pointermove', onPointerHover)
      domElement.addEventListener('pointerup', onPointerUp)

      return () => {
        removeComponent(entity, TransformGizmoVisualComponent)
        removeComponent(entity, TransformGizmoPlaneComponent)

        domElement.removeEventListener('pointerdown', onPointerDown)
        domElement.removeEventListener('pointermove', onPointerHover)
        domElement.removeEventListener('pointermove', onPointerMove)
        domElement.removeEventListener('pointerup', onPointerUp)
      }
    }, [])

    useExecute(
      () => {
        updateMatrixWorld()
      },
      { before: PresentationSystemGroup }
    )

    return null
  }
  /*reset: function(entity, component) {
    if (!component.value.enabled) return

    if (component.value.dragging) {
      const entityTransform = getComponent(entity, TransformComponent)
      entityTransform.position.copy(_positionStart)
      entityTransform.rotation.copy(_quaternionStart)
      entityTransform.scale.copy(_scaleStart)

      pointStart.copy(pointEnd)
    }
  }*/
})

const _tempEuler = new Euler()
const _alignVector = new Vector3(0, 1, 0)
const _zeroVector = new Vector3(0, 0, 0)
const _lookAtMatrix = new Matrix4()
const _identityQuaternion = new Quaternion()

const _unitX = new Vector3(1, 0, 0)
const _unitY = new Vector3(0, 1, 0)
const _unitZ = new Vector3(0, 0, 1)

const _v1 = new Vector3()
const _v2 = new Vector3()
const _v3 = new Vector3()

export const TransformGizmoVisualComponent = defineComponent({
  name: 'TransformGizmoVisualComponent',

  onInit(entity) {
    return {
      gizmoCombined: null! as Object3D,
      gizmo: null,
      picker: null,
      helper: null
    }
  },

  onRemove: (entity, component) => {
    // remove all child geometry
  },

  reactor: function (props) {
    const entity = useEntityContext() // the dummy entity
    const gizmoControls = useComponent(entity, TransformGizmoControlComponent) // necesssity
    const gizmoVisual = useComponent(entity, TransformGizmoVisualComponent)
    const _tempQuaternion2 = new Quaternion()

    function createGizmo() {
      const gizmoMaterial = new MeshBasicMaterial({
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        transparent: true
      })

      const gizmoLineMaterial = new LineBasicMaterial({
        depthTest: false,
        depthWrite: false,
        fog: false,
        toneMapped: false,
        transparent: true
      })

      // Make unique material for each axis/color

      const matInvisible = gizmoMaterial.clone()
      matInvisible.opacity = 0.15

      const matHelper = gizmoLineMaterial.clone()
      matHelper.opacity = 0.5

      const matRed = gizmoMaterial.clone()
      matRed.color.setHex(0xff0000)

      const matGreen = gizmoMaterial.clone()
      matGreen.color.setHex(0x00ff00)

      const matBlue = gizmoMaterial.clone()
      matBlue.color.setHex(0x0000ff)

      const matRedTransparent = gizmoMaterial.clone()
      matRedTransparent.color.setHex(0xff0000)
      matRedTransparent.opacity = 0.5

      const matGreenTransparent = gizmoMaterial.clone()
      matGreenTransparent.color.setHex(0x00ff00)
      matGreenTransparent.opacity = 0.5

      const matBlueTransparent = gizmoMaterial.clone()
      matBlueTransparent.color.setHex(0x0000ff)
      matBlueTransparent.opacity = 0.5

      const matWhiteTransparent = gizmoMaterial.clone()
      matWhiteTransparent.opacity = 0.25

      const matYellowTransparent = gizmoMaterial.clone()
      matYellowTransparent.color.setHex(0xffff00)
      matYellowTransparent.opacity = 0.25

      const matYellow = gizmoMaterial.clone()
      matYellow.color.setHex(0xffff00)

      const matGray = gizmoMaterial.clone()
      matGray.color.setHex(0x787878)

      // reusable geometry

      const arrowGeometry = new CylinderGeometry(0, 0.04, 0.1, 12)
      arrowGeometry.translate(0, 0.05, 0)

      const scaleHandleGeometry = new BoxGeometry(0.08, 0.08, 0.08)
      scaleHandleGeometry.translate(0, 0.04, 0)

      const lineGeometry = new BufferGeometry()
      lineGeometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3))

      const lineGeometry2 = new CylinderGeometry(0.0075, 0.0075, 0.5, 3)
      lineGeometry2.translate(0, 0.25, 0)

      function CircleGeometry(radius, arc) {
        const geometry = new TorusGeometry(radius, 0.0075, 3, 64, arc * Math.PI * 2)
        geometry.rotateY(Math.PI / 2)
        geometry.rotateX(Math.PI / 2)
        return geometry
      }

      // Special geometry for transform helper. If scaled with position vector it spans from [0,0,0] to position

      function TranslateHelperGeometry() {
        const geometry = new BufferGeometry()

        geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 1, 1, 1], 3))

        return geometry
      }

      // Gizmo definitions - custom hierarchy definitions for setupGizmo() function

      const gizmoTranslate = {
        X: [
          [new Mesh(arrowGeometry, matRed), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
          [new Mesh(arrowGeometry, matRed), [-0.5, 0, 0], [0, 0, Math.PI / 2]],
          [new Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, -Math.PI / 2]]
        ],
        Y: [
          [new Mesh(arrowGeometry, matGreen), [0, 0.5, 0]],
          [new Mesh(arrowGeometry, matGreen), [0, -0.5, 0], [Math.PI, 0, 0]],
          [new Mesh(lineGeometry2, matGreen)]
        ],
        Z: [
          [new Mesh(arrowGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
          [new Mesh(arrowGeometry, matBlue), [0, 0, -0.5], [-Math.PI / 2, 0, 0]],
          [new Mesh(lineGeometry2, matBlue), null, [Math.PI / 2, 0, 0]]
        ],
        XYZ: [[new Mesh(new OctahedronGeometry(0.1, 0), matWhiteTransparent.clone()), [0, 0, 0]]],
        XY: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent.clone()), [0.15, 0.15, 0]]],
        YZ: [
          [new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent.clone()), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]
        ],
        XZ: [
          [
            new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent.clone()),
            [0.15, 0, 0.15],
            [-Math.PI / 2, 0, 0]
          ]
        ]
      }

      const pickerTranslate = {
        X: [
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
        ],
        Y: [
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0.3, 0]],
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, -0.3, 0], [0, 0, Math.PI]]
        ],
        Z: [
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
        ],
        XYZ: [[new Mesh(new OctahedronGeometry(0.2, 0), matInvisible)]],
        XY: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0.15, 0]]],
        YZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
        XZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]]
      }

      const helperTranslate = {
        START: [[new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, 'helper']],
        END: [[new Mesh(new OctahedronGeometry(0.01, 2), matHelper), null, null, null, 'helper']],
        DELTA: [[new Line(TranslateHelperGeometry(), matHelper), null, null, null, 'helper']],
        X: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
        Y: [[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
        Z: [[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']]
      }

      const gizmoRotate = {
        XYZE: [[new Mesh(CircleGeometry(0.5, 1), matGray), null, [0, Math.PI / 2, 0]]],
        X: [[new Mesh(CircleGeometry(0.5, 0.5), matRed)]],
        Y: [[new Mesh(CircleGeometry(0.5, 0.5), matGreen), null, [0, 0, -Math.PI / 2]]],
        Z: [[new Mesh(CircleGeometry(0.5, 0.5), matBlue), null, [0, Math.PI / 2, 0]]],
        E: [[new Mesh(CircleGeometry(0.75, 1), matYellowTransparent), null, [0, Math.PI / 2, 0]]]
      }

      const helperRotate = {
        AXIS: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']]
      }

      const pickerRotate = {
        XYZE: [[new Mesh(new SphereGeometry(0.25, 10, 8), matInvisible)]],
        X: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, -Math.PI / 2, -Math.PI / 2]]],
        Y: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [Math.PI / 2, 0, 0]]],
        Z: [[new Mesh(new TorusGeometry(0.5, 0.1, 4, 24), matInvisible), [0, 0, 0], [0, 0, -Math.PI / 2]]],
        E: [[new Mesh(new TorusGeometry(0.75, 0.1, 2, 24), matInvisible)]]
      }

      const gizmoScale = {
        X: [
          [new Mesh(scaleHandleGeometry, matRed), [0.5, 0, 0], [0, 0, -Math.PI / 2]],
          [new Mesh(lineGeometry2, matRed), [0, 0, 0], [0, 0, -Math.PI / 2]],
          [new Mesh(scaleHandleGeometry, matRed), [-0.5, 0, 0], [0, 0, Math.PI / 2]]
        ],
        Y: [
          [new Mesh(scaleHandleGeometry, matGreen), [0, 0.5, 0]],
          [new Mesh(lineGeometry2, matGreen)],
          [new Mesh(scaleHandleGeometry, matGreen), [0, -0.5, 0], [0, 0, Math.PI]]
        ],
        Z: [
          [new Mesh(scaleHandleGeometry, matBlue), [0, 0, 0.5], [Math.PI / 2, 0, 0]],
          [new Mesh(lineGeometry2, matBlue), [0, 0, 0], [Math.PI / 2, 0, 0]],
          [new Mesh(scaleHandleGeometry, matBlue), [0, 0, -0.5], [-Math.PI / 2, 0, 0]]
        ],
        XY: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matBlueTransparent), [0.15, 0.15, 0]]],
        YZ: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matRedTransparent), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
        XZ: [[new Mesh(new BoxGeometry(0.15, 0.15, 0.01), matGreenTransparent), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]],
        XYZ: [[new Mesh(new BoxGeometry(0.1, 0.1, 0.1), matWhiteTransparent.clone())]]
      }

      const pickerScale = {
        X: [
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0.3, 0, 0], [0, 0, -Math.PI / 2]],
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [-0.3, 0, 0], [0, 0, Math.PI / 2]]
        ],
        Y: [
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0.3, 0]],
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, -0.3, 0], [0, 0, Math.PI]]
        ],
        Z: [
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, 0.3], [Math.PI / 2, 0, 0]],
          [new Mesh(new CylinderGeometry(0.2, 0, 0.6, 4), matInvisible), [0, 0, -0.3], [-Math.PI / 2, 0, 0]]
        ],
        XY: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0.15, 0]]],
        YZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0, 0.15, 0.15], [0, Math.PI / 2, 0]]],
        XZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.01), matInvisible), [0.15, 0, 0.15], [-Math.PI / 2, 0, 0]]],
        XYZ: [[new Mesh(new BoxGeometry(0.2, 0.2, 0.2), matInvisible), [0, 0, 0]]]
      }

      const helperScale = {
        X: [[new Line(lineGeometry, matHelper.clone()), [-1e3, 0, 0], null, [1e6, 1, 1], 'helper']],
        Y: [[new Line(lineGeometry, matHelper.clone()), [0, -1e3, 0], [0, 0, Math.PI / 2], [1e6, 1, 1], 'helper']],
        Z: [[new Line(lineGeometry, matHelper.clone()), [0, 0, -1e3], [0, -Math.PI / 2, 0], [1e6, 1, 1], 'helper']]
      }

      // Creates an Object3D with gizmos described in custom hierarchy definition.

      function setupGizmo(gizmoMap) {
        const gizmo = new Object3D()

        for (const name in gizmoMap) {
          for (let i = gizmoMap[name].length; i--; ) {
            const object = gizmoMap[name][i][0].clone()
            const position = gizmoMap[name][i][1]
            const rotation = gizmoMap[name][i][2]
            const scale = gizmoMap[name][i][3]
            const tag = gizmoMap[name][i][4]

            // name and tag properties are essential for picking and updating logic.
            object.name = name
            object.tag = tag

            if (position) {
              object.position.set(position[0], position[1], position[2])
            }

            if (rotation) {
              object.rotation.set(rotation[0], rotation[1], rotation[2])
            }

            if (scale) {
              object.scale.set(scale[0], scale[1], scale[2])
            }

            object.updateMatrix()

            const tempGeometry = object.geometry.clone()
            tempGeometry.applyMatrix4(object.matrix)
            object.geometry = tempGeometry
            object.renderOrder = Infinity

            object.position.set(0, 0, 0)
            object.rotation.set(0, 0, 0)
            object.scale.set(1, 1, 1)

            gizmo.add(object)
          }
        }

        return gizmo
      }

      // Gizmo creation

      const gizmo = {}
      const picker = {}
      const helper = {}
      const gizmoCombined = new Object3D()
      gizmoCombined.add((gizmo['translate'] = setupGizmo(gizmoTranslate)))
      gizmoCombined.add((gizmo['rotate'] = setupGizmo(gizmoRotate)))
      gizmoCombined.add((gizmo['scale'] = setupGizmo(gizmoScale)))
      gizmoCombined.add((picker['translate'] = setupGizmo(pickerTranslate)))
      gizmoCombined.add((picker['rotate'] = setupGizmo(pickerRotate)))
      gizmoCombined.add((picker['scale'] = setupGizmo(pickerScale)))
      gizmoCombined.add((helper['translate'] = setupGizmo(helperTranslate)))
      gizmoCombined.add((helper['rotate'] = setupGizmo(helperRotate)))
      gizmoCombined.add((helper['scale'] = setupGizmo(helperScale)))
      setObjectLayers(gizmoCombined, ObjectLayers.TransformGizmo)

      // Pickers should be hidden always

      picker['translate'].visible = false
      picker['rotate'].visible = false
      picker['scale'].visible = false

      return { gizmoCombined, gizmo, picker, helper }
    }

    useEffect(() => {
      const { gizmoCombined, gizmo, picker, helper } = createGizmo()
      gizmoVisual.gizmoCombined.set(gizmoCombined as any)
      gizmoVisual.gizmo.set(gizmo as any)
      gizmoVisual.picker.set(picker as any)
      gizmoVisual.helper.set(helper as any)

      addObjectToGroup(entity, gizmoCombined)
      return () => {
        gizmoCombined.traverse(function (child: Mesh) {
          if (child.geometry) child.geometry.dispose()
          if (child.material) (child.material as Material).dispose()
        })
        gizmoVisual.gizmo.set(null)
        gizmoVisual.picker.set(null)
        gizmoVisual.helper.set(null)
      }
    }, [])

    function updateMatrixWorld() {
      const space =
        gizmoControls.value.transformMode === TransformMode.scale
          ? TransformSpace.local
          : gizmoControls.value.transformSpace // scale always oriented to local rotation
      const currentTransform = getComponent(gizmoControls.entity.value, TransformComponent)

      const quaternion = space === TransformSpace.local ? currentTransform.rotation : _identityQuaternion

      // Show only gizmos for current transform transformMode
      const gizmo = gizmoVisual.value.gizmo as any
      gizmo['translate'].visible = gizmoControls.value.transformMode === TransformMode.translate
      gizmo['rotate'].visible = gizmoControls.value.transformMode === TransformMode.rotate
      gizmo['scale'].visible = gizmoControls.value.transformMode === TransformMode.scale

      const helper = gizmoVisual.value.helper as any
      helper['translate'].visible = gizmoControls.value.transformMode === TransformMode.translate
      helper['rotate'].visible = gizmoControls.value.transformMode === TransformMode.rotate
      helper['scale'].visible = gizmoControls.value.transformMode === TransformMode.scale

      const picker = gizmoVisual.value.picker as any
      let handles = []
      handles = handles.concat(picker[gizmoControls.value.transformMode].children)
      handles = handles.concat(gizmo[gizmoControls.value.transformMode].children)
      handles = handles.concat(helper[gizmoControls.value.transformMode].children)

      for (let i = 0; i < handles.length; i++) {
        const handle: any = handles[i]

        // hide aligned to camera

        handle.visible = true
        handle.rotation.set(0, 0, 0)
        handle.position.copy(currentTransform.position)

        /*if (this.camera.isOrthographicCamera) {
          factor = (this.camera.top - this.camera.bottom) / this.camera.zoom
        } else {*/
        const factor =
          currentTransform.position.distanceTo(
            getComponent(Engine.instance.cameraEntity, TransformComponent).position
          ) *
          Math.min(
            (1.9 * Math.tan((Math.PI * getComponent(Engine.instance.cameraEntity, CameraComponent).fov) / 360)) /
              getComponent(Engine.instance.cameraEntity, CameraComponent).zoom,
            7
          )
        //}

        handle.scale.set(1, 1, 1).multiplyScalar((factor * gizmoControls.value.size) / 4)

        // TODO: simplify helpers and consider decoupling from gizmo

        if (handle.tag === 'helper') {
          handle.visible = false

          if (handle.name === 'AXIS') {
            handle.visible = !!gizmoControls.value.axis

            if (gizmoControls.value.axis === TransformAxis.X) {
              _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, 0))
              handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

              if (Math.abs(_alignVector.copy(_unitX).applyQuaternion(quaternion).dot(eye)) > 0.9) {
                handle.visible = false
              }
            }

            if (gizmoControls.value.axis === TransformAxis.Y) {
              _tempQuaternion.setFromEuler(_tempEuler.set(0, 0, Math.PI / 2))
              handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

              if (Math.abs(_alignVector.copy(_unitY).applyQuaternion(quaternion).dot(eye)) > 0.9) {
                handle.visible = false
              }
            }

            if (gizmoControls.value.axis === TransformAxis.Z) {
              _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
              handle.quaternion.copy(quaternion).multiply(_tempQuaternion)

              if (Math.abs(_alignVector.copy(_unitZ).applyQuaternion(quaternion).dot(eye)) > 0.9) {
                handle.visible = false
              }
            }

            if (gizmoControls.value.axis === TransformAxis.XYZE) {
              _tempQuaternion.setFromEuler(_tempEuler.set(0, Math.PI / 2, 0))
              _alignVector.copy(rotationAxis)
              handle.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(_zeroVector, _alignVector, _unitY))
              handle.quaternion.multiply(_tempQuaternion)
              handle.visible = this.dragging
            }

            if (gizmoControls.value.axis === TransformAxis.E) {
              handle.visible = false
            }
          } else if (handle.name === 'START') {
            handle.position.copy(worldPositionStart)
            handle.visible = gizmoControls.dragging.value
          } else if (handle.name === 'END') {
            handle.position.copy(currentTransform.position)
            handle.visible = gizmoControls.dragging.value
          } else if (handle.name === 'DELTA') {
            handle.position.copy(worldPositionStart)
            handle.quaternion.copy(worldQuaternionStart)
            _tempVector
              .set(1e-10, 1e-10, 1e-10)
              .add(worldPositionStart)
              .sub(currentTransform.position)
              .multiplyScalar(-1)
            _tempVector.applyQuaternion(worldQuaternionStart.clone().invert())
            handle.scale.copy(_tempVector)
            handle.visible = gizmoControls.dragging.value
          } else {
            handle.quaternion.copy(quaternion)

            if (gizmoControls.value.dragging) {
              handle.position.copy(worldPositionStart)
            } else {
              handle.position.copy(currentTransform.position)
            }

            if (gizmoControls.value.axis) {
              handle.visible = gizmoControls.value.axis.search(handle.name) !== -1
            }
          }

          // If updating helper, skip rest of the loop
          continue
        }

        // Align handles to current local or world rotation

        handle.quaternion.copy(quaternion)

        if (
          gizmoControls.value.transformMode === TransformMode.translate ||
          gizmoControls.value.transformMode === TransformMode.scale
        ) {
          // Hide translate and scale axis facing the camera

          const AXIS_HIDE_THRESHOLD = 0.99
          const PLANE_HIDE_THRESHOLD = 0.2

          if (handle.name === TransformAxis.X) {
            if (Math.abs(_alignVector.copy(_unitX).applyQuaternion(quaternion).dot(eye)) > AXIS_HIDE_THRESHOLD) {
              handle.scale.set(1e-10, 1e-10, 1e-10)
              handle.visible = false
            }
          }

          if (handle.name === TransformAxis.Y) {
            if (Math.abs(_alignVector.copy(_unitY).applyQuaternion(quaternion).dot(eye)) > AXIS_HIDE_THRESHOLD) {
              handle.scale.set(1e-10, 1e-10, 1e-10)
              handle.visible = false
            }
          }

          if (handle.name === TransformAxis.Z) {
            if (Math.abs(_alignVector.copy(_unitZ).applyQuaternion(quaternion).dot(eye)) > AXIS_HIDE_THRESHOLD) {
              handle.scale.set(1e-10, 1e-10, 1e-10)
              handle.visible = false
            }
          }

          if (handle.name === TransformAxis.XY) {
            if (Math.abs(_alignVector.copy(_unitZ).applyQuaternion(quaternion).dot(eye)) < PLANE_HIDE_THRESHOLD) {
              handle.scale.set(1e-10, 1e-10, 1e-10)
              handle.visible = false
            }
          }

          if (handle.name === TransformAxis.YZ) {
            if (Math.abs(_alignVector.copy(_unitX).applyQuaternion(quaternion).dot(eye)) < PLANE_HIDE_THRESHOLD) {
              handle.scale.set(1e-10, 1e-10, 1e-10)
              handle.visible = false
            }
          }

          if (handle.name === TransformAxis.XZ) {
            if (Math.abs(_alignVector.copy(_unitY).applyQuaternion(quaternion).dot(eye)) < PLANE_HIDE_THRESHOLD) {
              handle.scale.set(1e-10, 1e-10, 1e-10)
              handle.visible = false
            }
          }
        } else if (gizmoControls.value.transformMode === TransformMode.rotate) {
          // Align handles to current local or world rotation

          _tempQuaternion2.copy(quaternion)
          _alignVector.copy(eye).applyQuaternion(_tempQuaternion.copy(quaternion).invert())

          if (handle.name.search(TransformAxis.E) !== -1) {
            handle.quaternion.setFromRotationMatrix(_lookAtMatrix.lookAt(eye, _zeroVector, _unitY))
          }

          if (handle.name === TransformAxis.X) {
            _tempQuaternion.setFromAxisAngle(_unitX, Math.atan2(-_alignVector.y, _alignVector.z))
            _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion)
            handle.quaternion.copy(_tempQuaternion)
          }

          if (handle.name === TransformAxis.Y) {
            _tempQuaternion.setFromAxisAngle(_unitY, Math.atan2(_alignVector.x, _alignVector.z))
            _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion)
            handle.quaternion.copy(_tempQuaternion)
          }

          if (handle.name === TransformAxis.Z) {
            _tempQuaternion.setFromAxisAngle(_unitZ, Math.atan2(_alignVector.y, _alignVector.x))
            _tempQuaternion.multiplyQuaternions(_tempQuaternion2, _tempQuaternion)
            handle.quaternion.copy(_tempQuaternion)
          }
        }

        // Hide disabled axes
        handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.X) === -1 || gizmoControls.value.showX)
        handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.Y) === -1 || gizmoControls.value.showY)
        handle.visible = handle.visible && (handle.name.indexOf(TransformAxis.Z) === -1 || gizmoControls.value.showZ)
        handle.visible =
          handle.visible &&
          (handle.name.indexOf(TransformAxis.E) === -1 ||
            (gizmoControls.value.showX && gizmoControls.value.showY && gizmoControls.value.showZ))

        // highlight selected axis

        handle.material._color = handle.material._color || handle.material.color.clone()
        handle.material._opacity = handle.material._opacity || handle.material.opacity

        handle.material.color.copy(handle.material._color)
        handle.material.opacity = handle.material._opacity

        if (gizmoControls.value.enabled && gizmoControls.value.axis) {
          if (handle.name === gizmoControls.value.axis) {
            handle.material.color.setHex(0xffff00)
            handle.material.opacity = 1.0
          } else if (
            gizmoControls.value.axis.split('').some(function (a) {
              return handle.name === a
            })
          ) {
            handle.material.color.setHex(0xffff00)
            handle.material.opacity = 1.0
          }
        }
      }
    }

    useExecute(
      () => {
        updateMatrixWorld()
      },
      { before: PresentationSystemGroup }
    )

    return null
  }
})

export const TransformGizmoPlaneComponent = defineComponent({
  name: 'TransformGizmoPlaneComponent',

  onInit(entity) {
    const plane = null! as Mesh
    return plane
  },
  reactor: function (props) {
    const entity = useEntityContext() // the dummy entity
    const gizmoControls = useComponent(entity, TransformGizmoControlComponent) // necesssity
    const gizmoPlane = useComponent(entity, TransformGizmoPlaneComponent)
    const _dirVector = new Vector3()
    const _tempMatrix = new Matrix4()

    useEffect(() => {
      gizmoPlane.set(
        new Mesh(
          new PlaneGeometry(100000, 100000, 2, 2),
          new MeshBasicMaterial({
            visible: false,
            wireframe: true,
            side: DoubleSide,
            transparent: true,
            opacity: 0.1,
            toneMapped: false
          })
        )
      )
      setObjectLayers(gizmoPlane.value, ObjectLayers.TransformGizmo)
      return () => {
        gizmoPlane.value.traverse(function (child: Mesh) {
          if (child.geometry) child.geometry.dispose()
          if (child.material) (child.material as Material).dispose()
        })
      }
    }, [])

    function updateMatrixWorld() {
      let space = gizmoControls.transformSpace.value
      const currentTransform = getComponent(gizmoControls.entity.value, TransformComponent)

      gizmoPlane.value.position.copy(currentTransform.position)

      if (gizmoControls.value.transformMode === TransformMode.scale) space = TransformSpace.local // scale always oriented to local rotation

      _v1.copy(_unitX).applyQuaternion(space === TransformSpace.local ? currentTransform.rotation : _identityQuaternion)
      _v2.copy(_unitY).applyQuaternion(space === TransformSpace.local ? currentTransform.rotation : _identityQuaternion)
      _v3.copy(_unitZ).applyQuaternion(space === TransformSpace.local ? currentTransform.rotation : _identityQuaternion)

      // Align the plane for current transform transformMode, axis and space.

      _alignVector.copy(_v2)

      switch (gizmoControls.value.transformMode) {
        case TransformMode.translate:
        case TransformMode.scale:
          switch (gizmoControls.axis.value) {
            case TransformAxis.X:
              _alignVector.copy(eye).cross(_v1)
              _dirVector.copy(_v1).cross(_alignVector)
              break
            case TransformAxis.Y:
              _alignVector.copy(eye).cross(_v2)
              _dirVector.copy(_v2).cross(_alignVector)
              break
            case TransformAxis.Z:
              _alignVector.copy(eye).cross(_v3)
              _dirVector.copy(_v3).cross(_alignVector)
              break
            case TransformAxis.XY:
              _dirVector.copy(_v3)
              break
            case TransformAxis.YZ:
              _dirVector.copy(_v1)
              break
            case TransformAxis.XZ:
              _alignVector.copy(_v3)
              _dirVector.copy(_v2)
              break
            case TransformAxis.XYZ:
            case TransformAxis.E:
              _dirVector.set(0, 0, 0)
              break
          }

          break
        case TransformMode.rotate:
        default:
          // special case for rotate
          _dirVector.set(0, 0, 0)
      }

      if (_dirVector.length() === 0) {
        // If in rotate mode, make the plane parallel to camera
        gizmoPlane.value.quaternion.copy(getComponent(Engine.instance.cameraEntity, TransformComponent).rotation)
      } else {
        _tempMatrix.lookAt(_tempVector.set(0, 0, 0), _dirVector, _alignVector)

        gizmoPlane.value.quaternion.setFromRotationMatrix(_tempMatrix)
      }
    }

    useExecute(
      () => {
        updateMatrixWorld()
      },
      { before: PresentationSystemGroup }
    )

    return null
  }
})
