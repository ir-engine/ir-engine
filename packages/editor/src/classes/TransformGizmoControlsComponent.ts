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
  setComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { TransformControlsGizmo, TransformControlsPlane } from '@etherealengine/engine/src/scene/classes/TransformGizmo'

import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { V_001, V_010, V_100 } from '@etherealengine/engine/src/common/constants/MathConstants'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { UndefinedEntity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { EntityTreeComponent } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { defineQuery } from '@etherealengine/engine/src/ecs/functions/QueryFunctions'
import { useExecute } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/SystemGroups'
import { EngineRenderer } from '@etherealengine/engine/src/renderer/WebGLRendererSystem'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { SceneObjectComponent } from '@etherealengine/engine/src/scene/components/SceneObjectComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { ObjectLayers } from '@etherealengine/engine/src/scene/constants/ObjectLayers'
import {
  TransformAxis,
  TransformAxisType,
  TransformMode,
  TransformModeType,
  TransformSpace,
  TransformSpaceType
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { Box3, Quaternion, Raycaster, Vector3 } from 'three'
import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'

export const TransformGizmoControlComponent = defineComponent({
  name: 'TransformGizmoControl',

  onInit(entity) {
    //const control = new TransformControls()
    const control = {
      entity: UndefinedEntity,
      enabled: true,
      axis: null as TransformAxisType | null,
      mode: TransformMode.translate as TransformModeType,
      translationSnap: null,
      rotationSnap: null,
      scaleSnap: null,
      space: TransformSpace.world as TransformSpaceType,
      size: 1,
      dragging: false,
      showX: true,
      showY: true,
      showZ: true,
      worldPosition: new Vector3(),
      worldPositionStart: new Vector3(),
      worldQuaternion: new Quaternion(),
      worldQuaternionStart: new Quaternion(),
      cameraPosition: new Vector3(),
      cameraQuaternion: new Quaternion(),
      pointStart: new Vector3(),
      pointEnd: new Vector3(),
      rotationAxis: new Vector3(),
      rotationAngle: 0,
      eye: new Vector3()
    }
    return control
  },
  onRemove: (entity, component) => {
    //component.value.detach()
    //component.value.dispose()
  },
  reactor: function (props) {
    const entity = useEntityContext()
    const gizmoControlComponent = useComponent(entity, TransformGizmoControlComponent)
    const editorHelperState = useHookstate(getMutableState(EditorHelperState))
    const query = defineQuery([SceneObjectComponent]) // hardcoded for now until we can make it dynamic
    const selectionState = useHookstate(getMutableState(SelectionState))
    const gizmoEntity = createEntity()
    const box = new Box3()
    const transformComponent = useComponent(entity, TransformComponent)
    const domElement = EngineRenderer.instance.renderer.domElement
    //temp variables
    const _tempVector = new Vector3()
    const _tempVector2 = new Vector3()
    const _tempQuaternion = new Quaternion()
    const _unit = {
      X: V_100,
      Y: V_010,
      Z: V_001
    }

    //private variables
    const _raycaster = new Raycaster()
    _raycaster.layers.set(ObjectLayers.TransformGizmo)
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
    const _gizmo = new TransformControlsGizmo()
    const _plane = new TransformControlsPlane()
    const _offset = new Vector3()
    const _startNorm = new Vector3()
    const _endNorm = new Vector3()
    const _cameraScale = new Vector3()

    const _parentQuaternionInv = new Quaternion()
    const _parentScale = new Vector3()

    const _worldScaleStart = new Vector3()
    const _worldQuaternionInv = new Quaternion()
    const _worldScale = new Vector3()

    const _positionStart = new Vector3()
    const _quaternionStart = new Quaternion()
    const _scaleStart = new Vector3()

    function pointerHover(pointer) {
      if (gizmoControlComponent.entity.value === UndefinedEntity || gizmoControlComponent.dragging.value === true)
        return

      _raycaster.setFromCamera(pointer, camera)

      const intersect = intersectObjectWithRay(_gizmo.picker[gizmoControlComponent.mode.value], _raycaster, true)

      if (intersect) {
        gizmoControlComponent.axis.set(intersect.object.name)
      } else {
        gizmoControlComponent.axis.set(null)
      }
    }

    function pointerDown(pointer) {
      if (
        gizmoControlComponent.entity.value === UndefinedEntity ||
        gizmoControlComponent.dragging.value === true ||
        pointer.button !== 0
      )
        return

      if (gizmoControlComponent.axis.value !== null) {
        _raycaster.setFromCamera(pointer, camera)

        const planeIntersect = intersectObjectWithRay(_plane, _raycaster, true)

        if (planeIntersect) {
          const currenttransform = getComponent(gizmoControlComponent.entity.value, TransformComponent)
          _positionStart.copy(currenttransform.position)
          _quaternionStart.copy(currenttransform.rotation)
          _scaleStart.copy(currenttransform.scale)

          //currenttransform.matrix.decompose(worldPosStart, worldQuatStart, _worldScaleStart)
          gizmoControlComponent.worldPositionStart.set(currenttransform.position)
          gizmoControlComponent.worldQuaternionStart.set(currenttransform.rotation)
          _worldScaleStart.copy(currenttransform.scale)

          gizmoControlComponent.pointStart.set(planeIntersect.point.sub(gizmoControlComponent.worldPositionStart.value))
        }

        gizmoControlComponent.dragging.set(true)
        //;(_mouseDownEvent as any).mode = this.mode
        //this.dispatchEvent(_mouseDownEvent as any)
      }
    }

    function pointerMove(pointer) {
      const axis = gizmoControlComponent.axis.value
      const mode = gizmoControlComponent.mode.value
      const entity = gizmoControlComponent.entity.value
      let space = gizmoControlComponent.space.value

      if (mode === TransformMode.scale) {
        space = TransformSpace.local
      } else if (axis === TransformAxis.E || axis === TransformAxis.XYZE || axis === TransformAxis.XYZ) {
        space = TransformSpace.world
      }

      if (
        entity === UndefinedEntity ||
        axis === null ||
        gizmoControlComponent.dragging.value === false ||
        pointer.button !== -1
      )
        return

      _raycaster.setFromCamera(pointer, camera)

      const planeIntersect = intersectObjectWithRay(_plane, _raycaster, true)

      if (!planeIntersect) return

      gizmoControlComponent.pointEnd.set(planeIntersect.point.sub(gizmoControlComponent.worldPositionStart.value))

      if (mode === TransformMode.translate) {
        // Apply translate
        const newPosition = getComponent(entity, TransformComponent).position
        _offset.copy(gizmoControlComponent.pointEnd.value).sub(gizmoControlComponent.pointStart.value)

        if (space === TransformSpace.local && axis !== TransformAxis.XYZ) {
          _offset.applyQuaternion(_worldQuaternionInv)
        }

        if (axis.indexOf(TransformAxis.X) === -1) _offset.x = 0
        if (axis.indexOf(TransformAxis.Y) === -1) _offset.y = 0
        if (axis.indexOf(TransformAxis.Z) === -1) _offset.z = 0

        if (space === TransformSpace.local && axis !== TransformAxis.XYZ) {
          _offset.applyQuaternion(_quaternionStart).divide(_parentScale)
        } else {
          _offset.applyQuaternion(_parentQuaternionInv).divide(_parentScale)
        }
        newPosition.copy(_offset).add(_positionStart)

        // Apply translation snap
        const translationSnap = gizmoControlComponent.translationSnap.value
        if (translationSnap) {
          if (space === TransformSpace.local) {
            newPosition.applyQuaternion(_tempQuaternion.copy(_quaternionStart).invert())

            if (axis.search(TransformAxis.X) !== -1) {
              newPosition.x = Math.round(newPosition.x / translationSnap) * translationSnap
            }

            if (axis.search(TransformAxis.Y) !== -1) {
              newPosition.y = Math.round(newPosition.y / translationSnap) * translationSnap
            }

            if (axis.search(TransformAxis.Z) !== -1) {
              newPosition.z = Math.round(newPosition.z / translationSnap) * translationSnap
            }

            newPosition.applyQuaternion(_quaternionStart)
          }

          if (space === TransformSpace.world) {
            const parent = getComponent(entity, EntityTreeComponent)
            if (parent && parent.parentEntity !== UndefinedEntity) {
              newPosition.add(getComponent(parent.parentEntity!, TransformComponent).position)
            }

            if (axis.search(TransformAxis.X) !== -1) {
              newPosition.x = Math.round(newPosition.x / translationSnap) * translationSnap
            }

            if (axis.search(TransformAxis.Y) !== -1) {
              newPosition.y = Math.round(newPosition.y / translationSnap) * translationSnap
            }

            if (axis.search(TransformAxis.Z) !== -1) {
              newPosition.z = Math.round(newPosition.z / translationSnap) * translationSnap
            }

            if (parent && parent.parentEntity !== UndefinedEntity) {
              newPosition.sub(getComponent(parent.parentEntity!, TransformComponent).position)
            }
          }
        }
        setComponent(entity, TransformComponent, { position: newPosition })
      } else if (mode === TransformMode.scale) {
        if (axis.search(TransformAxis.XYZ) !== -1) {
          let d = gizmoControlComponent.pointEnd.value.length() / gizmoControlComponent.pointStart.value.length()

          if (gizmoControlComponent.pointEnd.value.dot(gizmoControlComponent.pointStart.value) < 0) d *= -1

          _tempVector2.set(d, d, d)
        } else {
          _tempVector.copy(gizmoControlComponent.pointStart.value)
          _tempVector2.copy(gizmoControlComponent.pointEnd.value)

          _tempVector.applyQuaternion(_worldQuaternionInv)
          _tempVector2.applyQuaternion(_worldQuaternionInv)

          _tempVector2.divide(_tempVector)

          if (axis.search(TransformAxis.X) === -1) {
            _tempVector2.x = 1
          }

          if (axis.search(TransformAxis.Y) === -1) {
            _tempVector2.y = 1
          }

          if (axis.search(TransformAxis.Z) === -1) {
            _tempVector2.z = 1
          }
        }

        // Apply scale
        const newScale = getComponent(entity, TransformComponent).scale
        newScale.copy(_scaleStart).multiply(_tempVector2)
        const scaleSnap = gizmoControlComponent.scaleSnap.value
        if (scaleSnap) {
          if (axis.search(TransformAxis.X) !== -1) {
            newScale.x = Math.round(newScale.x / scaleSnap) * scaleSnap || scaleSnap
          }

          if (axis.search(TransformAxis.Y) !== -1) {
            newScale.y = Math.round(newScale.y / scaleSnap) * scaleSnap || scaleSnap
          }

          if (axis.search(TransformAxis.Z) !== -1) {
            newScale.z = Math.round(newScale.z / scaleSnap) * scaleSnap || scaleSnap
          }
        }
        setComponent(entity, TransformComponent, { scale: newScale })
      } else if (mode === TransformMode.rotate) {
        _offset.copy(gizmoControlComponent.pointEnd.value).sub(gizmoControlComponent.pointStart.value)

        const ROTATION_SPEED =
          20 /
          gizmoControlComponent.worldPosition.value.distanceTo(_tempVector.setFromMatrixPosition(camera.matrixWorld))

        let _inPlaneRotation = false

        if (axis === TransformAxis.XYZE) {
          gizmoControlComponent.rotationAxis.set(_offset.cross(gizmoControlComponent.eye.value).normalize())
          gizmoControlComponent.rotationAngle.set(
            _offset.dot(
              _tempVector.copy(gizmoControlComponent.rotationAxis.value).cross(gizmoControlComponent.eye.value)
            ) * ROTATION_SPEED
          )
        } else if (axis === TransformAxis.X || axis === TransformAxis.Y || axis === TransformAxis.Z) {
          gizmoControlComponent.rotationAxis.set(_unit[axis])

          _tempVector.copy(_unit[axis])

          if (space === TransformSpace.local) {
            _tempVector.applyQuaternion(gizmoControlComponent.worldQuaternion.value)
          }

          _tempVector.cross(gizmoControlComponent.eye.value)

          // When _tempVector is 0 after cross with this.eye the vectors are parallel and should use in-plane rotation logic.
          if (_tempVector.length() === 0) {
            _inPlaneRotation = true
          } else {
            gizmoControlComponent.rotationAngle.set(_offset.dot(_tempVector.normalize()) * ROTATION_SPEED)
          }
        }

        if (axis === TransformAxis.E || _inPlaneRotation) {
          gizmoControlComponent.rotationAxis.set(gizmoControlComponent.eye.value)
          gizmoControlComponent.rotationAngle.set(
            gizmoControlComponent.pointEnd.value.angleTo(gizmoControlComponent.pointStart.value)
          )

          _startNorm.copy(gizmoControlComponent.pointStart.value).normalize()
          _endNorm.copy(gizmoControlComponent.pointEnd.value).normalize()

          gizmoControlComponent.rotationAngle.set(
            gizmoControlComponent.rotationAngle.value *
              _endNorm.cross(_startNorm).dot(gizmoControlComponent.eye.value) <
              0
              ? 1
              : -1
          )
        }

        // Apply rotation snap

        if (gizmoControlComponent.rotationSnap.value)
          gizmoControlComponent.rotationAngle.set(
            Math.round(gizmoControlComponent.rotationAngle.value / gizmoControlComponent.rotationSnap.value) *
              gizmoControlComponent.rotationSnap.value
          )
        const newRotation = getComponent(entity, TransformComponent).rotation
        // Apply rotate
        if (space === TransformSpace.local && axis !== TransformAxis.E && axis !== TransformAxis.XYZE) {
          newRotation.copy(_quaternionStart)
          newRotation
            .multiply(
              _tempQuaternion.setFromAxisAngle(
                gizmoControlComponent.rotationAxis.value,
                gizmoControlComponent.rotationAngle.value
              )
            )
            .normalize()
        } else {
          gizmoControlComponent.rotationAxis.set(
            gizmoControlComponent.rotationAxis.value.applyQuaternion(_parentQuaternionInv)
          )
          newRotation.copy(
            _tempQuaternion.setFromAxisAngle(
              gizmoControlComponent.rotationAxis.value,
              gizmoControlComponent.rotationAngle.value
            )
          )
          newRotation.multiply(_quaternionStart).normalize()
        }

        setComponent(entity, TransformComponent, { rotation: newRotation })
      }

      //this.dispatchEvent(_changeEvent as any)
      //this.dispatchEvent(_objectChangeEvent as any)
    }

    function pointerUp(pointer) {
      if (pointer.button !== 0) return

      if (gizmoControlComponent.dragging.value && gizmoControlComponent.axis.value !== null) {
        //_mouseUpEvent.mode = gizmoControlComponent.mode
        //this.dispatchEvent(_mouseUpEvent as any)
      }
      // cannot call editor function here, better to keep thee event system
      gizmoControlComponent.dragging.set(false)
      gizmoControlComponent.axis.set(null)
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
      if (!gizmoControlComponent.enabled.value) return

      switch (event.pointerType) {
        case 'mouse':
        case 'pen':
          // eslint-disable-next-line no-case-declarations
          pointerHover(getPointer(event))
      }
    }

    function onPointerDown(event) {
      if (!gizmoControlComponent.enabled.value) return

      if (!document.pointerLockElement) {
        domElement.setPointerCapture(event.pointerId)
      }

      domElement.addEventListener('pointermove', onPointerMove)

      pointerHover(getPointer(event))
      pointerDown(getPointer(event))
    }

    function onPointerMove(event) {
      if (!gizmoControlComponent.enabled.value) return

      pointerMove(getPointer(event))
    }

    function onPointerUp(event) {
      if (!gizmoControlComponent.enabled.value) return

      domElement.releasePointerCapture(event.pointerId)

      domElement.removeEventListener('pointermove', onPointerMove)

      pointerUp(getPointer(event))
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

    useExecute(() => {}, { with: PresentationSystemGroup })
    useEffect(() => {
      // create dummy object to attach gizmo to, we can only attach to three js objects
      domElement.addEventListener('pointerdown', onPointerDown)
      domElement.addEventListener('pointermove', onPointerHover)
      domElement.addEventListener('pointerup', onPointerUp)
      /*gizmoControlComponent.value.addEventListener('mouseUp', (event) => {
        EditorControlFunctions.positionObject([entity], [transformComponent.value.position])
        EditorControlFunctions.rotateObject(
          [entity],
          [new Euler().setFromQuaternion(transformComponent.value.rotation)]
        )
        EditorControlFunctions.scaleObject([entity], [transformComponent.value.scale], true)
        //check for snap modes
        if (!getState(ObjectGridSnapState).enabled) {
          EditorControlFunctions.commitTransformSave([entity])
        } else {
          getMutableState(ObjectGridSnapState).apply.set(true)
        }
      })*/

      // create dummy Entity for gizmo helper
      setComponent(gizmoEntity, NameComponent, 'gizmoEntity')
      setComponent(gizmoEntity, VisibleComponent)
      //addObjectToGroup(gizmoEntity, gizmoControlComponent.value) // adding object calls attach internally on the gizmo, so attch entity last

      //gizmoControlComponent.value.attach(entity)

      return () => {
        domElement.removeEventListener('pointerdown', onPointerDown)
        domElement.removeEventListener('pointermove', onPointerHover)
        domElement.removeEventListener('pointermove', onPointerMove)
        domElement.removeEventListener('pointerup', onPointerUp)
        removeEntity(gizmoEntity)
      }
    }, [])
    /*
    useEffect(() => {
      const mode = editorHelperState.transformMode.value
      gizmoControlComponent.value.setMode(mode)
    }, [editorHelperState.transformMode])

    useEffect(() => {
      const mode = editorHelperState.transformMode.value
      gizmoControlComponent.value.setMode(mode)
    }, [editorHelperState.transformMode])

    useEffect(() => {
      if (selectionState.selectedEntities.value.length < 1) return
      let newPosition = getComponent(entity, TransformComponent).position
      const selectedEntities = selectionState.selectedEntities.value.filter((value) => query().includes(value))
      const selectedTransform = getComponent(selectedEntities[selectedEntities.length - 1], TransformComponent)

      switch (editorHelperState.transformPivot.value) {
        case TransformPivot.Origin:
          newPosition = new Vector3(0, 0, 0)
          break
        case TransformPivot.Selection:
          newPosition = selectedTransform.position
          break
        case TransformPivot.Center:
        case TransformPivot.Bottom:
          box.makeEmpty()

          for (let i = 0; i < selectedEntities.length; i++) {
            const parentEnt = selectedEntities[i]
            const isUuid = typeof parentEnt === 'string'
            if (isUuid) {
              box.expandByObject(Engine.instance.scene.getObjectByProperty('uuid', parentEnt)!)
            } else {
              box.expandByPoint(getComponent(parentEnt, TransformComponent).position)
            }
          }
          box.getCenter(newPosition)

          if (editorHelperState.transformPivot.value === TransformPivot.Bottom) newPosition.y = box.min.y
          break
      }

      setComponent(entity, TransformComponent, { position: newPosition })
    }, [editorHelperState.transformPivot, selectionState.selectedEntities])

    useEffect(() => {
      const space = editorHelperState.transformSpace.value
      gizmoControlComponent.value.setSpace(space)
    }, [editorHelperState.transformSpace])

    useEffect(() => {
      switch (editorHelperState.gridSnap.value) {
        case SnapMode.Disabled: // continous update
          gizmoControlComponent.value.setTranslationSnap(null)
          gizmoControlComponent.value.setRotationSnap(null)
          gizmoControlComponent.value.setScaleSnap(null)
          break
        case SnapMode.Grid:
          gizmoControlComponent.value.setTranslationSnap(editorHelperState.translationSnap.value)
          gizmoControlComponent.value.setRotationSnap(degToRad(editorHelperState.rotationSnap.value))
          gizmoControlComponent.value.setScaleSnap(editorHelperState.scaleSnap.value)
          break
      }
    }, [editorHelperState.gridSnap])

    useEffect(() => {
      gizmoControlComponent.value.setTranslationSnap(
        editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.translationSnap.value : null
      )
    }, [editorHelperState.translationSnap])

    useEffect(() => {
      gizmoControlComponent.value.setRotationSnap(
        editorHelperState.gridSnap.value === SnapMode.Grid ? degToRad(editorHelperState.rotationSnap.value) : null
      )
    }, [editorHelperState.rotationSnap])

    useEffect(() => {
      gizmoControlComponent.value.setScaleSnap(
        editorHelperState.gridSnap.value === SnapMode.Grid ? editorHelperState.scaleSnap.value : null
      )
    }, [editorHelperState.scaleSnap])*/

    return null
  }
})
