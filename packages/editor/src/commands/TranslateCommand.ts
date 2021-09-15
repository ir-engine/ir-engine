import Command, { CommandParams } from './Command'
import { TransformSpace } from '../constants/TransformSpace'
import { serializeObject3D, serializeVector3 } from '../functions/debug'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import { Matrix4, Vector3 } from 'three'
import EditorEvents from '../constants/EditorEvents'
import arrayShallowEqual from '../functions/arrayShallowEqual'

export interface TranslateCommandParams extends CommandParams {
  translation?: any

  space?: any
}

export default class TranslateCommand extends Command {
  translation: any

  space: any

  oldPositions: any

  constructor(objects?: any | any[], params?: TranslateCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects
    this.translation = params.translation.clone()
    this.space = params.space
    this.oldPositions = objects.map((o) => o.position.clone())
  }

  execute() {
    this.updateTranslation(this.affectedObjects, this.translation, this.space)

    this.emitAfterExecuteEvent()
  }

  shouldUpdate(newCommand) {
    return this.space === newCommand.space && arrayShallowEqual(this.affectedObjects, newCommand.objects)
  }

  update(command) {
    this.translation.add(command.translation)
    this.updateTranslation(this.affectedObjects, command.translation, this.space)
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.POSITION, this.affectedObjects, { position: this.oldPositions, space: TransformSpace.Local, shouldEmitEvent: false })
  }

  toString() {
    return `TranslateCommand id: ${this.id} object: ${serializeObject3D(this.affectedObjects)} translation: ${serializeVector3(
      this.translation
    )} space: ${this.space}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'position')
    }
  }


  updateTranslation(objects: any[], position: any, space: any): void {
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

      const _translation = Array.isArray(position) ? position[i] : position

      if (space === TransformSpace.Local) {
        object.position.add(_translation)
      } else {
        object.updateMatrixWorld() // Update parent world matrices
        tempVector.setFromMatrixPosition(object.matrixWorld)
        tempVector.add(_translation)

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
