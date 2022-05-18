import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import {
  ComponentConstructor,
  ComponentType,
  getComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'

import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeProperties } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

type PropertyType = {
  [key: string]: any
}

export interface ModifyPropertyCommandParams<C extends ComponentConstructor<any, any>> extends CommandParams {
  properties: Partial<ComponentType<C>>
  component: C
}

export default class ModifyPropertyCommand<C extends ComponentConstructor<any, any>> extends Command {
  properties: PropertyType = {}

  component: ComponentConstructor<any, any>

  oldProperties?: PropertyType[]

  constructor(objects: EntityTreeNode[], params: ModifyPropertyCommandParams<C>) {
    super(objects, params)

    this.component = params.component

    const propertyNames = Object.keys(params.properties)
    for (const propertyName of propertyNames) {
      const value = params.properties[propertyName]
      this.properties[propertyName] = value && value.clone ? value.clone() : value
    }

    if (this.keepHistory && this.component) {
      this.oldProperties = []
      for (let i = 0; i < objects.length; i++) {
        const comp = getComponent(objects[i].entity, this.component)
        const oldProps = {}

        for (const propertyName of propertyNames) {
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

  shouldUpdate(newCommand: ModifyPropertyCommand<any>): boolean {
    return (
      this.component === newCommand.component &&
      arrayShallowEqual(Object.keys(this.properties), Object.keys(newCommand.properties)) &&
      arrayShallowEqual(this.affectedObjects, newCommand.affectedObjects)
    )
  }

  update(command: ModifyPropertyCommand<any>) {
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
    const propertyNames = Object.keys(properties)

    for (let i = 0; i < nodes.length; i++) {
      const entity = nodes[i].entity
      if (component) {
        const comp = getComponent(entity, component)
        if (comp) {
          for (const propertyName of propertyNames) {
            const value = properties[propertyName]
            const { result, finalProp } = this.getNestedObject(comp, propertyName)

            if (value && value.copy) {
              if (!result[finalProp]) result[finalProp] = new value.constructor()
              result[finalProp].copy(value)
            } else if (
              value &&
              typeof result[finalProp] === 'object' &&
              'set' in result[finalProp] &&
              typeof result[finalProp].set === 'function'
            ) {
              result[finalProp].set(value)
            } else {
              result[finalProp] = value
            }
          }
        }
      }
      const nodeComponent = getComponent(entity, EntityNodeComponent)
      for (const component of nodeComponent.components) {
        const update = useWorld().sceneLoadingRegistry.get(component)?.update
        if (update) update(nodes[i].entity, properties)
      }
    }

    for (const propertyName of propertyNames) {
      store.dispatch(SelectionAction.changedObject(this.affectedObjects, propertyName))
    }

    store.dispatch(EditorAction.sceneModified(true))
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
