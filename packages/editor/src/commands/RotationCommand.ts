import Command, { CommandParams } from './Command'
import { TransformSpace } from '../constants/TransformSpace'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeEuler } from '../functions/debug'
import { Matrix4, Quaternion, Vector3 } from 'three'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'

export interface RotationCommandParams extends CommandParams {
  rotations?: Vector3 | Vector3[]

  space?: any
}

export default class RotationCommand extends Command {
  rotations: Vector3[]

  space: any

  oldRotations: any

  constructor(objects?: any | any[], params?: RotationCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    if (!Array.isArray(params.rotations)) {
      params.rotations = [params.rotations]
    }

    this.affectedObjects = objects.slice(0)
    this.rotations = params.rotations.map((r) => r.clone())
    this.space = params.space ?? TransformSpace.Local
    this.oldRotations = objects.map((o) => o.rotation.clone())
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
    this.updateRotation(this.affectedObjects, command.rotations, this.space)
    this.emitAfterExecuteEvent()
  }

  undo() {
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

  updateRotation(objects: any[], rotations: any[], space: any): void {
    const tempMatrix = new Matrix4()
    const tempQuaternion1 = new Quaternion()
    const tempQuaternion2 = new Quaternion()

    let spaceMatrix

    if (space === TransformSpace.LocalSelection) {
      if (CommandManager.instance.selected.length > 0) {
        const lastSelectedObject = CommandManager.instance.selected[CommandManager.instance.selected.length - 1]
        lastSelectedObject.updateMatrixWorld()
        spaceMatrix = lastSelectedObject.parent.matrixWorld
      } else {
        spaceMatrix = tempMatrix.identity()
      }
    }

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      const rot = rotations[i] ?? rotations[0]

      if (space === TransformSpace.Local) {
        object.rotation.copy(rot)
      } else {
        object.updateMatrixWorld() // Update parent world matrices

        let _spaceMatrix = space === TransformSpace.World ? object.parent.matrixWorld : spaceMatrix

        const newWorldQuaternion = tempQuaternion1.setFromEuler(rot)
        const inverseParentWorldQuaternion = tempQuaternion2.setFromRotationMatrix(_spaceMatrix).inverse()
        const newLocalQuaternion = inverseParentWorldQuaternion.multiply(newWorldQuaternion)
        object.quaternion.copy(newLocalQuaternion)
      }

      object.updateMatrixWorld(true)

      object.onChange('rotation')
    }
  }
}
