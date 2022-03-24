import { Matrix4, Vector3 } from 'three'

import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeVector3 } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams, IDENTITY_MAT_4 } from './Command'

export interface ScaleCommandParams extends CommandParams {
  scales: Vector3 | Vector3[]

  space?: TransformSpace

  overrideScale?: boolean
}

export default class ScaleCommand extends Command {
  scales: Vector3[]

  space: TransformSpace

  oldScales?: Vector3[]

  overrideScale: boolean

  constructor(objects: EntityTreeNode[], params: ScaleCommandParams) {
    super(objects, params)

    this.space = params.space ?? TransformSpace.Local
    this.overrideScale = params.overrideScale ?? false
    this.scales = Array.isArray(params.scales) ? params.scales : [params.scales]

    if (this.keepHistory) {
      this.oldScales = objects.map((o) => getComponent(o.entity, Object3DComponent).value.scale.clone())
    }
  }

  execute() {
    this.updateScale(this.affectedObjects, this.scales, this.space, this.overrideScale)
    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand: ScaleCommand): boolean {
    return this.space === newCommand.space && arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
  }

  update(command) {
    if (this.overrideScale) {
      this.scales = command.scales
    } else {
      this.scales.forEach((s: Vector3, index: number) => s.multiply(command.scales[index]))
    }

    this.updateScale(this.affectedObjects, command.scales, this.space, this.overrideScale)
    this.emitAfterExecuteEvent()
  }

  undo() {
    if (!this.oldScales) return

    this.updateScale(this.affectedObjects, this.oldScales, TransformSpace.Local, true)
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `SetScaleMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} scale: ${serializeVector3(this.scales)} space: ${this.space}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedObject(this.affectedObjects, 'scale'))
    }
  }

  updateScale(objects: EntityTreeNode[], scales: Vector3[], space: TransformSpace, overrideScale?: boolean): void {
    if (!overrideScale) {
      for (let i = 0; i < objects.length; i++) {
        const object = objects[i]
        const scale = scales[i] ?? scales[0]

        if (space === TransformSpace.World && (scale.x !== scale.y || scale.x !== scale.z || scale.y !== scale.z)) {
          console.warn('Scaling an object in world space with a non-uniform scale is not supported')
        }

        getComponent(object.entity, TransformComponent).scale.multiply(scale)
      }

      return
    }

    const tempMatrix = new Matrix4()
    const tempVector = new Vector3()

    let spaceMatrix = IDENTITY_MAT_4

    if (space === TransformSpace.LocalSelection) {
      const selectedEntities = accessSelectionState().selectedEntities.value

      if (selectedEntities.length > 0) {
        const lastSelectedEntity = selectedEntities[selectedEntities.length - 1]
        const lastSelectedObj3d = getComponent(lastSelectedEntity, Object3DComponent).value
        lastSelectedObj3d.updateMatrixWorld()
        spaceMatrix = lastSelectedObj3d.parent!.matrixWorld
      }
    }

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      const scale = scales[i] ?? scales[0]
      let obj3d = getComponent(object.entity, Object3DComponent).value
      let transformComponent = getComponent(object.entity, TransformComponent)

      if (space === TransformSpace.Local) {
        tempVector.set(
          scale.x === 0 ? Number.EPSILON : scale.x,
          scale.y === 0 ? Number.EPSILON : scale.y,
          scale.z === 0 ? Number.EPSILON : scale.z
        )

        transformComponent.scale.copy(tempVector)
      } else {
        obj3d.updateMatrixWorld() // Update parent world matrices

        tempVector.copy(scale)

        let _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : spaceMatrix

        tempMatrix.copy(_spaceMatrix).invert()
        tempVector.applyMatrix4(tempMatrix)

        tempVector.set(
          tempVector.x === 0 ? Number.EPSILON : tempVector.x,
          tempVector.y === 0 ? Number.EPSILON : tempVector.y,
          tempVector.z === 0 ? Number.EPSILON : tempVector.z
        )

        transformComponent.scale.copy(tempVector)
      }
    }
  }
}
