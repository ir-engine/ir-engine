import Command, { CommandParams } from './Command'
import { serializeProperties, serializeObject3DArray } from '../functions/debug'
import EditorEvents from '../constants/EditorEvents'
import { CommandManager } from '../managers/CommandManager'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { ComponentConstructor, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { ComponentUpdateFunction } from '@xrengine/engine/src/common/constants/PrefabFunctionType'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

type PropertyType = {
  [key: string]: any
}

export interface ModifyPropertyCommandParams extends CommandParams {
  properties: PropertyType
  component: ComponentConstructor<any, any>
  updateFunction?: ComponentUpdateFunction
}

export default class ModifyPropertyCommand extends Command {
  properties: PropertyType = {}

  component: ComponentConstructor<any, any>

  updateFunction?: ComponentUpdateFunction

  oldProperties?: PropertyType[]

  constructor(objects: EntityTreeNode[], params: ModifyPropertyCommandParams) {
    super(objects, params)

    this.component = params.component
    this.updateFunction = params.updateFunction

    for (const propertyName in params.properties) {
      const value = params.properties[propertyName]
      this.properties[propertyName] = value && value.clone ? value.clone() : value
    }

    if (this.keepHistory) {
      this.oldProperties = []
      for (let i = 0; i < objects.length; i++) {
        const comp = getComponent(objects[i].entity, this.component)
        const oldProps = {}

        for (const propertyName in params.properties) {
          const { result, finalProp } = this.getNestedObject(comp, propertyName)
          const oldValue = result[finalProp]
          oldProps[propertyName] = oldValue && oldValue.clone ? oldValue.clone() : oldValue
        }

        this.oldProperties.push(oldProps)
      }
    }
  }

  execute() {
    this.updateProperties(this.affectedObjects, this.properties, this.component)
  }

  shouldUpdate(newCommand: ModifyPropertyCommand): boolean {
    return (
      this.component === newCommand.component &&
      this.updateFunction === newCommand.updateFunction &&
      arrayShallowEqual(Object.keys(this.properties), Object.keys(newCommand.properties)) &&
      arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
    )
  }

  update(command: ModifyPropertyCommand) {
    this.properties = command.properties
    this.updateProperties(this.affectedObjects, command.properties, this.component)
  }

  undo() {
    if (!this.oldProperties) return

    for (let i = 0; i < this.oldProperties.length; i++) {
      this.updateProperties(this.affectedObjects, this.oldProperties[i], this.component)
    }
  }

  toString() {
    return `SetPropertiesMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} properties: ${serializeProperties(this.properties)}`
  }

  updateProperties(nodes: EntityTreeNode[], properties: PropertyType, component: ComponentConstructor<any, any>): void {
    for (let i = 0; i < nodes.length; i++) {
      const comp = getComponent(nodes[i].entity, component)

      if (!comp) continue

      for (const propertyName in properties) {
        const value = properties[propertyName]
        const { result, finalProp } = this.getNestedObject(comp, propertyName)

        if (value && value.copy) {
          if (!result[finalProp]) result[finalProp] = new value.constructor()
          result[finalProp].copy(value)
        } else {
          result[finalProp] = value
        }
      }

      this.updateFunction && this.updateFunction(nodes[i].entity)
    }

    for (const propertyName in properties) {
      CommandManager.instance.emitEvent(EditorEvents.OBJECTS_CHANGED, this.affectedObjects, propertyName)
    }
  }

  getNestedObject(object: any, propertyName: string): { result: any; finalProp: string } {
    const props = propertyName.split('.')
    let result = object

    for (let i = 0; i < props.length - 1; i++) {
      result = result[props[i]]
    }

    return { result, finalProp: props[props.length - 1] }
  }
}
