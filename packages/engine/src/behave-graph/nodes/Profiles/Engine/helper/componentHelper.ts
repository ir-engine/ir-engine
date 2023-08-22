/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { NodeCategory, NodeDefinition, makeFlowNodeDefinition } from '@behave-graph/core'
import { toQuat, toVector3, toVector4 } from '@behave-graph/scene'
import { Color, Matrix3, Matrix4, Quaternion, Vector2, Vector3, Vector4 } from 'three'
import { AvatarAnimationComponent } from '../../../../../avatar/components/AvatarAnimationComponent'
import { Entity, UndefinedEntity } from '../../../../../ecs/classes/Entity'
import {
  Component,
  ComponentMap,
  EntityRemovedComponent,
  setComponent
} from '../../../../../ecs/functions/ComponentFunctions'
import { PostProcessingComponent } from '../../../../../scene/components/PostProcessingComponent'

const skipComponents = [
  EntityRemovedComponent.name, // pointless
  PostProcessingComponent.name, //needs special attention
  AvatarAnimationComponent.name, // needs special attention
  'EE_behaveGraph' // infinite loop
]
// behave graph is initialized last
// this function runs before it fully initialized
// must be initialized first to use it as a component,therefore must hardcode, else infinite loop
export function generateComponentNodeschema(component: Component) {
  const nodeschema = {}
  if (skipComponents.includes(component.name)) return nodeschema

  const schema = component.schema ? component.schema : component.onInit(UndefinedEntity)
  if (!schema) {
    return nodeschema
  }
  //console.log("DEBUG", component.name )
  for (const [name, value] of Object.entries(schema)) {
    switch (typeof value) {
      case 'number':
        if (name.toLowerCase().includes('entity')) nodeschema[name] = 'entity'
        else {
          nodeschema[name] = 'float'
        }
        // use float
        break
      case 'boolean':
        nodeschema[name] = 'boolean'
        // use boolean
        break
      case 'string':
        nodeschema[name] = 'string'
      // use boolean
      case 'undefined':
        nodeschema[name] = 'string'
      case 'object':
        if (value instanceof Vector2) {
          nodeschema[name] = 'vec2'
        } else if (value instanceof Vector3) {
          nodeschema[name] = 'vec3'
        } else if (value instanceof Vector4) {
          nodeschema[name] = 'vec4'
        } else if (value instanceof Quaternion) {
          nodeschema[name] = 'quat'
        } else if (value instanceof Matrix4) {
          nodeschema[name] = 'mat4'
        } else if (value instanceof Matrix3) {
          nodeschema[name] = 'mat3'
        } else if (value instanceof Color) {
          nodeschema[name] = 'color'
        }
        break
      case 'function':
        break
      default: // for objects will handle them later maybe decompose furthur?
        break
      // use string
    }
  }
  //console.log("DEBUG", nodeschema )
  return nodeschema
}

export function NodetoEnginetype(value, valuetype) {
  switch (valuetype) {
    case 'float':
    case 'integer':
      return Number(value)
      break
    case 'string':
      return String(value)
    case 'vec3':
    case 'vec2':
      return toVector3(value)
    case 'quat':
      return toQuat(value)
    case 'vec4':
      return toVector4(value)
    case 'mat4':
      return new Matrix4().fromArray(value.elements)
    case 'mat3':
      return new Matrix3().fromArray(value.elements)
    case 'color':
      return new Color().setFromVector3(value)
    case 'boolean':
      typeof Boolean
      return Boolean(value)
    default:
  }
}

export function getComponentSetters() {
  const setters: NodeDefinition[] = []
  for (const [componentName, component] of ComponentMap) {
    if (skipComponents.includes(componentName)) continue
    const inputsockets = generateComponentNodeschema(component)
    if (Object.keys(inputsockets).length === 0) continue
    const node = makeFlowNodeDefinition({
      typeName: `engine/component/set${componentName}`,
      category: NodeCategory.Action,
      label: `set ${componentName}`,
      in: {
        flow: 'flow',
        entity: 'entity',
        ...inputsockets
      },
      out: { flow: 'flow', entity: 'entity' },
      initialState: undefined,
      triggered: ({ read, write, commit, graph }) => {
        const entity = Number.parseInt(read('entity')) as Entity
        //read from the read and set dict acccordingly
        const inputs = Object.entries(node.in).splice(2)
        //console.log("DEBUG",inputs)
        const values = {}
        for (const [input, type] of inputs) {
          values[input] = NodetoEnginetype(read(input as any), type)
        }
        //console.log("DEBUG",values)
        setComponent(entity, component, values)
        write('entity', entity)
        commit('flow')
      }
    })
    setters.push(node)
  }
  console.log('DEBUG', setters)
  return setters
}
