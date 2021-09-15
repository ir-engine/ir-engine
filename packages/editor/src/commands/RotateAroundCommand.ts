import Command, { CommandParams } from './Command'
import { TransformSpace } from '../constants/TransformSpace'
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

  pivot: any
}

export default class RotateAroundCommand extends Command {
  pivot: any

  axis: any

  angle: any

  oldRotations: any

  oldPositions: any

  space: any

  constructor(objects?: any | any[], params?: RotateOnAxisCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects.slice(0)
    this.pivot = params.pivot.clone()
    this.axis = params.axis.clone()
    this.angle = params.angle
    this.space = params.space
    this.oldRotations = objects.map((o) => o.rotation.clone())
    this.oldPositions = objects.map((o) => o.position.clone())
  }

  execute() {
    this.rotateAround(this.affectedObjects, this.pivot, this.axis, this.angle)
    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand) {
    return (
      this.pivot.equals(newCommand.pivot) &&
      this.axis.equals(newCommand.axis) &&
      arrayShallowEqual(this.affectedObjects, newCommand.objects)
    )
  }

  update(command) {
    this.angle += command.angle
    this.rotateAround(this.affectedObjects, this.pivot, this.axis, command.angle)
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.ROTATION, this.affectedObjects, { rotation: this.oldRotations, space: TransformSpace.Local, shouldEmitEvent: false })
    CommandManager.instance.executeCommand(EditorCommands.POSITION, this.affectedObjects, { position: this.oldPositions, space: TransformSpace.Local, shouldEmitEvent: false })
  }

  toString() {
    return `RotateAroundMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} pivot: ${serializeVector3(this.pivot)} axis: { ${serializeVector3(this.axis)} angle: ${this.angle} space: ${
      this.space
    }`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'matrix')
    }
  }

  rotateAround(objects: any[], pivot: any, axis: any, angle: any): void {
    const tempMatrix1 = new Matrix4()
    const tempMatrix2 = new Matrix4()
    const tempMatrix3 = new Matrix4()
    const tempMatrix4 = new Matrix4()

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      object.updateMatrixWorld()

      const matrixWorld = tempMatrix1.copy(object.matrixWorld)
      const inverseParentMatrixWorld = object.parent.matrixWorld.clone().invert()

      const pivotToOriginMatrix = tempMatrix2.makeTranslation(-pivot.x, -pivot.y, -pivot.z)
      const originToPivotMatrix = tempMatrix3.makeTranslation(pivot.x, pivot.y, pivot.z)

      const rotationMatrix = tempMatrix4.makeRotationAxis(axis, angle)

      matrixWorld
        .premultiply(pivotToOriginMatrix)
        .premultiply(rotationMatrix)
        .premultiply(originToPivotMatrix)
        .premultiply(inverseParentMatrixWorld)
        .decompose(object.position, object.quaternion, object.scale)

      object.updateMatrixWorld()
    }
  }
}
