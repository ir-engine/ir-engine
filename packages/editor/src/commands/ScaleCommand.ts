import Command, { CommandParams } from './Command'
import { TransformSpace } from '../constants/TransformSpace'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeVector3 } from '../functions/debug'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'
import { Matrix4, Vector3 } from 'three'

export interface ScaleCommandParams extends CommandParams {
  scales?: Vector3 | Vector3[]

  space?: TransformSpace

  overrideScale: boolean
}

export default class ScaleCommand extends Command {
  scales: Vector3[]

  space: TransformSpace

  oldScales: Vector3[]

  overrideScale: boolean

  constructor(objects?: any | any[], params?: ScaleCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects.slice(0)
    this.space = params.space ?? TransformSpace.Local
    this.overrideScale = params.overrideScale

    if (!params.scales) {
      params.scales = [new Vector3(1, 1, 1)]
    }

    if (!Array.isArray(params.scales)) {
      params.scales = [params.scales]
    }

    this.scales = params.scales.map((s) => s.clone())
    this.oldScales = objects.map((o) => o.scale.clone())
  }

  execute() {
    this.updateScale(this.affectedObjects, this.scales, this.space, this.overrideScale)
    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand: ScaleCommand) {
    return this.space === newCommand.space && arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
  }

  update(command) {
    if (this.overrideScale) {
      this.scales = command.scales.map((s) => s.clone())
    } else {
      this.scales.forEach((s: Vector3, index: number) => s.multiply(command.scales[index]))
    }

    this.updateScale(this.affectedObjects, command.scales, this.space, this.overrideScale)
    this.emitAfterExecuteEvent()
  }

  undo() {
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
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'scale')
    }
  }

  updateScale(objects: any[], scales: Vector3[], space: any, overrideScale?: boolean): void {
    if (!overrideScale) {
      for (let i = 0; i < objects.length; i++) {
        const object = objects[i]
        const scale = scales[i] ?? scales[0]

        if (space === TransformSpace.World && (scale.x !== scale.y || scale.x !== scale.z || scale.y !== scale.z)) {
          console.warn('Scaling an object in world space with a non-uniform scale is not supported')
        }

        object.scale.multiply(scale)

        object.updateMatrixWorld(true)

        object.onChange('scale')
      }

      return
    }

    const tempMatrix = new Matrix4()
    const tempVector = new Vector3()

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

      const scale = scales[i] ?? scales[0]

      if (space === TransformSpace.Local) {
        tempVector.set(
          scale.x === 0 ? Number.EPSILON : scale.x,
          scale.y === 0 ? Number.EPSILON : scale.y,
          scale.z === 0 ? Number.EPSILON : scale.z
        )

        object.scale.copy(tempVector)
      } else {
        object.updateMatrixWorld() // Update parent world matrices

        tempVector.copy(scale)

        let _spaceMatrix = space === TransformSpace.World ? object.parent.matrixWorld : spaceMatrix

        tempMatrix.copy(_spaceMatrix).invert()
        tempVector.applyMatrix4(tempMatrix)

        tempVector.set(
          tempVector.x === 0 ? Number.EPSILON : tempVector.x,
          tempVector.y === 0 ? Number.EPSILON : tempVector.y,
          tempVector.z === 0 ? Number.EPSILON : tempVector.z
        )

        object.scale.copy(tempVector)
      }

      object.updateMatrixWorld(true)

      object.onChange('scale')
    }
  }
}
