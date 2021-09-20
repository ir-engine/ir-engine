import Command, { CommandParams } from './Command'
import { serializeObject3DArray } from '../functions/debug'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'

export interface LoadMaterialSlotCommandParams extends CommandParams {
  subPieceId?: any
  materialSlotId?: any
  materialId?: any
}

export default class LoadMaterialSlotCommand extends Command {
  subPieceId: any

  materialSlotId: any

  materialId: any

  prevMaterialIds: any[]

  constructor(objects?: any | any[], params?: LoadMaterialSlotCommandParams) {
    super(objects, params)
    this.affectedObjects = objects.slice(0)
    this.subPieceId = params.subPieceId
    this.materialSlotId = params.materialSlotId
    this.materialId = params.materialId
    this.prevMaterialIds = objects.map((object) =>
      object.getMaterialIdForMaterialSlot(params.subPieceId, params.materialSlotId)
    )
  }

  execute() {
    this.loadMaterial(this.affectedObjects, this.subPieceId, this.materialSlotId, this.materialId)

    this.emitAfterExecuteEvent()
  }

  undo() {
    for (let i = 0; i < this.affectedObjects.length; i++) {
      this.loadMaterial(this.affectedObjects[i], this.subPieceId, this.materialSlotId, this.prevMaterialIds[i])
    }

    this.emitAfterExecuteEvent()
  }

  toString() {
    return `LoadMaterialSlotMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} subPieceId: ${this.subPieceId} materialSlotId: ${this.materialSlotId} materialId: ${this.materialId}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, 'materialSlot')
    }
  }

  loadMaterial(objects: any[], subPieceId: any, materialSlotId: any, materialId: any): void {
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]

      object.loadMaterialSlot(subPieceId, materialSlotId, materialId).catch(console.error)

      if (object.onChange) {
        object.onChange('materialSlot')
      }
    }
  }
}
