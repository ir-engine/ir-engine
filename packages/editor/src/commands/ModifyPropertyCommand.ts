import Command, { CommandParams } from './Command'
import { serializeProperties, serializeObject3DArray } from '../functions/debug'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'

type PropertyType = {
  [key: string]: any
}

export interface ModifyPropertyCommandParams extends CommandParams {
  properties?: PropertyType
}

export default class ModifyPropertyCommand extends Command {
  newProperties: PropertyType

  oldProperties: PropertyType[]

  constructor(objects?: any | any[], params?: ModifyPropertyCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects.slice(0)
    this.newProperties = {}
    this.oldProperties = []

    for (const propertyName in params.properties) {
      if (!Object.prototype.hasOwnProperty.call(params.properties, propertyName)) continue

      const value = params.properties[propertyName]
      this.newProperties[propertyName] = value && value.clone ? value.clone() : value
    }

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]
      const objectOldProperties = {}

      for (const propertyName in params.properties) {
        if (!Object.prototype.hasOwnProperty.call(params.properties, propertyName)) continue

        const res = this.getNestedObject(object, propertyName)
        const oldValue = res[propertyName]

        objectOldProperties[propertyName] = oldValue && oldValue.clone ? oldValue.clone() : oldValue
      }

      this.oldProperties.push(objectOldProperties)
    }
  }

  execute() {
    this.updateProperties(this.affectedObjects, this.newProperties)
  }

  undo() {
    for (let i = 0; i < this.oldProperties.length; i++) {
      this.updateProperties(this.affectedObjects, this.oldProperties[i])
    }
  }

  toString() {
    return `SetPropertiesMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} properties: ${serializeProperties(this.newProperties)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects)
    }
  }

  updateProperties(objects?: any[], properties?: PropertyType): void {
    for (const propertyName in properties) {
      if (!Object.prototype.hasOwnProperty.call(properties, propertyName)) continue

      const finalProp = propertyName.split('.').pop()

      for (let i = 0; i < objects.length; i++) {
        const object = objects[i]

        const value = properties[propertyName]

        const res = this.getNestedObject(object, propertyName)

        if (value && value.copy) {
          res[finalProp].copy(value)
        } else {
          res[finalProp] = value
        }

        if (object.onChange) {
          object.onChange(propertyName)
        }

        object.dirty = true
      }

      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, propertyName)
    }
  }

  getNestedObject(object: any, propertyName?: string): any {
    const props = propertyName.split('.')
    let result = object

    for (let i = 0; i < props.length - 1; i++) {
      result = result[props[i]]
    }

    return result
  }
}
