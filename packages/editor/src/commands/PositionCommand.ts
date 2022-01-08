import { Matrix4, Vector3 } from 'three'

import { TransformSpace } from '@xrengine/engine/src/scene/constants/transformConstants'

import EditorEvents from '../constants/EditorEvents'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3D, serializeVector3 } from '../functions/debug'
import { CommandManager } from '../managers/CommandManager'
import Command, { CommandParams } from './Command'

export interface PositionCommandParams extends CommandParams {
  positions?: Vector3 | Vector3[]

  space?: TransformSpace

  addToPosition?: boolean
}

export default class PositionCommand extends Command {
  positions: Vector3[]

  addToPosition?: boolean

  space: TransformSpace

  oldPositions: any

  constructor(objects?: any | any[], params?: PositionCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) objects = [objects]
    if (!Array.isArray(params.positions)) params.positions = [params.positions]

    this.affectedObjects = objects
    this.positions = params.positions
    this.space = params.space ?? TransformSpace.Local
    this.addToPosition = params.addToPosition
    this.oldPositions = objects.map((o) => o.position.clone())
  }

  execute() {
    this.updatePosition(this.affectedObjects, this.positions, this.space)

    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand: PositionCommand): boolean {
    return this.space === newCommand.space && arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
  }

  update(command: PositionCommand) {
    this.positions = command.positions
    this.updatePosition(this.affectedObjects, command.positions, this.space)
    this.emitAfterExecuteEvent()
  }

  undo() {
    this.updatePosition(this.affectedObjects, this.oldPositions, TransformSpace.Local, true)
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `SetPositionCommand id: ${this.id} object: ${serializeObject3D(
      this.affectedObjects
    )} position: ${serializeVector3(this.positions)} space: ${this.space}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'position')
    }
  }

  updatePosition(objects: any[], positions: Vector3[], space: TransformSpace, isUndo?: boolean): void {
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
      const pos = positions[i] ?? positions[0]

      if (space === TransformSpace.Local) {
        if (this.addToPosition && !isUndo) object.position.add(pos)
        else object.position.copy(pos)
      } else {
        object.updateMatrixWorld() // Update parent world matrices

        if (this.addToPosition && !isUndo) {
          tempVector.setFromMatrixPosition(object.matrixWorld)
          tempVector.add(pos)
        }

        let _spaceMatrix = space === TransformSpace.World ? object.parent.matrixWorld : spaceMatrix

        tempMatrix.copy(_spaceMatrix).invert()
        tempVector.applyMatrix4(tempMatrix)
        object.position.copy(tempVector)
      }

      object.updateMatrixWorld(true)

      object.onChange('position')
    }
  }
}
