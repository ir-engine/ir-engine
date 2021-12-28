import Command, { CommandParams } from './Command'
import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeVector3 } from '../functions/debug'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { Matrix4, Vector3 } from 'three'

export interface RotateOnAxisCommandParams extends CommandParams {
  axis?: any

  angle?: any

  space?: any
}

export default class RotateOnAxisCommand extends Command {
  axis: any

  angle: any

  space: any

  oldRotations: any

  constructor(objects?: any | any[], params?: RotateOnAxisCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects.slice(0)
    this.axis = params.axis.clone()
    this.angle = params.angle
    this.space = params.space
    this.oldRotations = objects.map((o) => o.rotation.clone())
  }

  execute() {
    this.updateRotationOnAxis(this.affectedObjects, this.axis, this.angle, this.space)
    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand: RotateOnAxisCommand) {
    return (
      this.space === newCommand.space &&
      this.axis.equals(newCommand.axis) &&
      arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
    )
  }

  update(command) {
    this.angle += command.angle
    this.updateRotationOnAxis(this.affectedObjects, this.axis, command.angle, this.space)
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.ROTATION, this.affectedObjects, {
      rotations: this.oldRotations,
      space: TransformSpace.Local,
      shouldEmitEvent: false
    })
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `RotateOnAxisMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} axis: ${serializeVector3(this.axis)} angle: ${this.angle} space: ${this.space}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'rotation')
    }
  }

  updateRotationOnAxis(objects: any[], axis: any, angle: any, space: any): void {
    const tempMatrix = new Matrix4()
    const tempVector = new Vector3()

    let spaceMatrix: any

    if (space === TransformSpace.LocalSelection) {
      if (CommandManager.instance.selected.length > 0) {
        const lastSelectedObject = CommandManager.instance.selected[CommandManager.instance.selected.length - 1]
        lastSelectedObject.updateMatrixWorld()
        spaceMatrix = lastSelectedObject.parent.matrixWorld
      } else {
        spaceMatrix = tempMatrix.identity().toString()
      }
    }

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      if (space === TransformSpace.Local) {
        object.rotateOnAxis(axis, angle)
      } else if (space === TransformSpace.World) {
        object.rotateOnWorldAxis(axis, angle)
      } else {
        object.updateMatrixWorld() // Update parent world matrices

        tempMatrix.copy(spaceMatrix).invert()
        tempVector.copy(axis).applyMatrix4(tempMatrix)

        object.rotateOnAxis(tempVector, angle)
      }

      object.updateMatrixWorld(true)

      object.onChange('position')
    }
  }
}
