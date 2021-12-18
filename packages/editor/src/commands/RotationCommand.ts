import Command, { CommandParams, IDENTITY_MAT_4 } from './Command'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeEuler } from '../functions/debug'
import { Matrix4, Quaternion, Euler } from 'three'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

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
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'rotation')
    }
  }

  updateRotation(objects: EntityTreeNode[], rotations: Euler[], space: TransformSpace): void {
    const T_QUAT_1 = new Quaternion()
    const T_QUAT_2 = new Quaternion()
    let spaceMatrix = IDENTITY_MAT_4

    if (space === TransformSpace.LocalSelection) {
      if (CommandManager.instance.selected.length > 0) {
        const lastSelectedObject = CommandManager.instance.selected[CommandManager.instance.selected.length - 1]
        const obj3d = getComponent(lastSelectedObject.entity, Object3DComponent).value
        obj3d.updateMatrixWorld()
        spaceMatrix = obj3d.parent!.matrixWorld
      }
    }

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]
      let obj3d = getComponent(object.entity, Object3DComponent).value
      let transformComponent = getComponent(object.entity, TransformComponent)

      T_QUAT_1.setFromEuler(rotations[i] ?? rotations[0])

      if (space === TransformSpace.Local) {
        transformComponent.rotation.copy(T_QUAT_1)
      } else {
        obj3d.updateMatrixWorld() // Update parent world matrices

        let _spaceMatrix = space === TransformSpace.World ? obj3d.parent!.matrixWorld : spaceMatrix

        const inverseParentWorldQuaternion = T_QUAT_2.setFromRotationMatrix(_spaceMatrix).invert()
        const newLocalQuaternion = inverseParentWorldQuaternion.multiply(T_QUAT_1)

        transformComponent.rotation.copy(newLocalQuaternion)
      }
    }
  }
}
