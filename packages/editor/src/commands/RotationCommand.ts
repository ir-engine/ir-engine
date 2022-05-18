import { Euler, Quaternion } from 'three'

import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'

import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeEuler, serializeObject3DArray } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams, IDENTITY_MAT_4 } from './Command'

export interface RotationCommandParams extends CommandParams {
  rotations: Euler | Euler[]

  space?: TransformSpace
}

export default class RotationCommand extends Command {
  rotations: Euler[]

  space: TransformSpace

  oldRotations?: Euler[]

  constructor(objects: EntityTreeNode[], params: RotationCommandParams) {
    super(objects, params)

    this.rotations = Array.isArray(params.rotations) ? params.rotations : [params.rotations]
    this.space = params.space ?? TransformSpace.Local

    if (this.keepHistory) {
      this.oldRotations = objects.map((o) => getComponent(o.entity, Object3DComponent).value.rotation.clone())
    }
  }

  execute() {
    this.updateRotation(this.affectedObjects, this.rotations, this.space)
    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand: RotationCommand) {
    return this.space === newCommand.space && arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
  }

  update(command) {
    this.rotations = command.rotations
    this.execute()
  }

  undo() {
    if (!this.oldRotations) return

    this.updateRotation(this.affectedObjects, this.oldRotations, this.space)
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `SetRotationMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} rotation: ${serializeEuler(this.rotations)} space: ${this.space}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedObject(this.affectedObjects, 'rotation'))
    }
  }

  updateRotation(objects: EntityTreeNode[], rotations: Euler[], space: TransformSpace): void {
    const T_QUAT_1 = new Quaternion()
    const T_QUAT_2 = new Quaternion()
    let spaceMatrix = IDENTITY_MAT_4

    if (space === TransformSpace.LocalSelection) {
      const selectedEntities = accessSelectionState().selectedEntities.value

      if (selectedEntities.length > 0) {
        const lastSelectedEntity = selectedEntities[selectedEntities.length - 1]
        const obj3d = getComponent(lastSelectedEntity, Object3DComponent).value
        obj3d.updateMatrixWorld()
        spaceMatrix = obj3d.parent!.matrixWorld
      }
    }

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]
      const obj3d = getComponent(object.entity, Object3DComponent).value
      const transformComponent = getComponent(object.entity, TransformComponent)

      T_QUAT_1.setFromEuler(rotations[i] ?? rotations[0])

      if (space === TransformSpace.Local) {
        transformComponent.rotation.copy(T_QUAT_1)
      } else {
        obj3d.updateMatrixWorld() // Update parent world matrices

        const _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : spaceMatrix

        const inverseParentWorldQuaternion = T_QUAT_2.setFromRotationMatrix(_spaceMatrix).invert()
        const newLocalQuaternion = inverseParentWorldQuaternion.multiply(T_QUAT_1)

        transformComponent.rotation.copy(newLocalQuaternion)
      }
    }
  }
}
