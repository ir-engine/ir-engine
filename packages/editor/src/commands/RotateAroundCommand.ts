import { Matrix4, Vector3 } from 'three'

import EditorEvents from '../constants/EditorEvents'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeVector3 } from '../functions/debug'
import { CommandManager } from '../managers/CommandManager'
import Command, { CommandParams } from './Command'

export interface RotateAroundCommandParams extends CommandParams {
  axis?: Vector3

  angle?: number

  pivot: Vector3
}

export default class RotateAroundCommand extends Command {
  pivot: Vector3

  axis: Vector3

  angle: number

  oldRotations: Vector3[]

  oldPositions: Vector3[]

  constructor(objects?: any | any[], params?: RotateAroundCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects.slice(0)
    this.pivot = params.pivot.clone()
    this.axis = params.axis.clone()
    this.angle = params.angle
    this.oldRotations = objects.map((o) => o.rotation.clone())
    this.oldPositions = objects.map((o) => o.position.clone())
  }

  execute() {
    this.rotateAround(this.affectedObjects, this.pivot, this.axis, this.angle)
    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand: RotateAroundCommand) {
    return (
      this.pivot.equals(newCommand.pivot) &&
      this.axis.equals(newCommand.axis) &&
      arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
    )
  }

  update(command) {
    this.angle += command.angle
    this.rotateAround(this.affectedObjects, this.pivot, this.axis, command.angle)
    this.emitAfterExecuteEvent()
  }

  undo() {
    this.rotateAround(this.affectedObjects, this.pivot, this.axis, this.angle * -1)
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `RotateAroundMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(this.affectedObjects)}
    pivot: ${serializeVector3(this.pivot)} axis: { ${serializeVector3(this.axis)} angle: ${this.angle} }`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'matrix')
    }
  }

  rotateAround(objects: any[], pivot: Vector3, axis: Vector3, angle: number): void {
    const tempMatrix1 = new Matrix4()
    const tempMatrix2 = new Matrix4()
    const tempMatrix3 = new Matrix4()
    const tempMatrix4 = new Matrix4()
    const pivotToOriginMatrix = tempMatrix2.makeTranslation(-pivot.x, -pivot.y, -pivot.z)
    const originToPivotMatrix = tempMatrix3.makeTranslation(pivot.x, pivot.y, pivot.z)
    const rotationMatrix = tempMatrix4.makeRotationAxis(axis, angle)

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      object.updateMatrixWorld()

      const matrixWorld = tempMatrix1.copy(object.matrixWorld)
      const inverseParentMatrixWorld = object.parent.matrixWorld.clone().invert()

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
