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

import { BooleanValue, EventEmitter, FloatValue, IntegerValue, StringValue, ValueType } from '@behave-graph/core'

import { ColorValue, EulerValue, IScene, QuatValue, Vec2Value, Vec3Value, Vec4Value } from '@behave-graph/scene'
import { Engine } from '../../../../../../ecs/classes/Engine'

export class EEScene implements IScene {
  public onSceneChanged = new EventEmitter<void>()
  private sceneVariables = {}
  private statePropertiesPaths = {}
  private valueRegistry: Record<string, ValueType>

  constructor() {
    this.valueRegistry = Object.fromEntries(
      [
        BooleanValue,
        StringValue,
        IntegerValue,
        FloatValue,
        Vec2Value,
        Vec3Value,
        Vec4Value,
        ColorValue,
        EulerValue,
        QuatValue
      ].map((valueType) => [valueType.name, valueType])
    )
    Object.entries(Engine.instance.store.stateMap).forEach((stateType) => {
      const properties = {}
      Object.keys(stateType[1]).forEach((property) => {
        properties[property] = property
      })
      this.statePropertiesPaths[stateType[0]] = properties
    })
    // pull in value type nodes
  }

  getProperty(jsonPath: string): any {
    const pathKeys = jsonPath.split('.')
    let currentLevel = this.sceneVariables

    for (const key of pathKeys) {
      if (!currentLevel[key]) {
        return undefined
      }
      currentLevel = currentLevel[key]
    }

    return currentLevel
  }

  setProperty(jsonPath: string, valueTypeName: string, value: any): void {
    const pathKeys = jsonPath.split('.')
    value = value ?? this.valueRegistry[valueTypeName]?.creator()
    this.sceneVariables = pathKeys.reduceRight((acc, key) => ({ [key]: acc }), value)
    this.onSceneChanged.emit()
  }

  addOnClickedListener(jsonPath: string, callback: (jsonPath: string) => void): void {
    console.log('added on clicked listener')
  }

  removeOnClickedListener(jsonPath: string, callback: (jsonPath: string) => void): void {
    console.log('removed on clicked listener')
  }

  getQueryableProperties() {
    return []
  }

  getRaycastableProperties() {
    return []
  }

  getStateProperties(stateType?: string) {
    const rootState = stateType ? this.statePropertiesPaths[stateType] : this.statePropertiesPaths
    const paths: string[] = []
    const stack: { node: any; path: string }[] = [{ node: rootState, path: '' }]

    while (stack.length > 0) {
      const { node, path } = stack.pop()!
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
          const newPath = path ? `${path}.${key}` : key
          if (typeof node[key] === 'object') {
            stack.push({ node: node[key], path: newPath })
          } else {
            paths.push(newPath)
          }
        }
      }
    }

    return paths
  }
  getProperties() {
    const paths: string[] = []
    const stack: { node: any; path: string }[] = [{ node: this.sceneVariables, path: '' }]

    while (stack.length > 0) {
      const { node, path } = stack.pop()!
      for (const key in node) {
        if (Object.prototype.hasOwnProperty.call(node, key)) {
          const newPath = path ? `${path}.${key}` : key
          if (typeof node[key] === 'object') {
            stack.push({ node: node[key], path: newPath })
          } else {
            paths.push(newPath)
          }
        }
      }
    }

    return paths
  }

  addOnSceneChangedListener() {
    console.log('added on scene changed listener')
  }

  removeOnSceneChangedListener(): void {
    console.log('removed on scene changed listener')
  }
}
