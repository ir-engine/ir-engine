import Command, { CommandParams } from './Command'
import { TransformSpace } from '../constants/TransformSpace'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeEuler } from '../functions/debug'
import { Matrix4, Quaternion } from 'three'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'

export interface RotationCommandParams extends CommandParams {
  rotation?: any

  space?: any
}

export default class RotationCommand extends Command {
  rotation: any

  space: any

  oldRotations: any

  constructor(objects?: any | any[], params?: RotationCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects.slice(0)
    this.rotation = params.rotation.clone()
    this.space = params.space
    this.oldRotations = objects.map((o) => o.rotation.clone())
  }

  execute() {
    this.updateRotation(this.affectedObjects, this.rotation, this.space)

    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand) {
    return this.space === newCommand.space && arrayShallowEqual(this.affectedObjects, newCommand.objects)
  }

  update(command) {
    this.rotation = command.rotation.clone()
    this.updateRotation(this.affectedObjects, command.rotation, this.space)
  }

  undo() {
    this.updateRotation(this.affectedObjects, this.oldRotations, this.space)
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `SetRotationMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} rotation: ${serializeEuler(this.rotation)} space: ${this.space}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'rotation')
    }
  }

  updateRotation(objects: any[], rotation: any, space: any): void {
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

      const rot = Array.isArray(rotation) ? rotation[i] : rotation

      if (space === TransformSpace.Local) {
        object.rotation.copy(rot)
      } else {
        object.updateMatrixWorld() // Update parent world matrices

        tempMatrix.copy(rot)

        let _spaceMatrix = space === TransformSpace.World ? object.parent.matrixWorld : spaceMatrix

        const newWorldQuaternion = tempQuaternion1.setFromEuler(rotation)
        const inverseParentWorldQuaternion = tempQuaternion2.setFromRotationMatrix(_spaceMatrix).inverse()
        const newLocalQuaternion = inverseParentWorldQuaternion.multiply(newWorldQuaternion)
        object.quaternion.copy(newLocalQuaternion)
      }

      object.updateMatrixWorld(true)

      object.onChange('rotation')
    }
  }
}
