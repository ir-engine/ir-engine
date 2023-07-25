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

import { BooleanValue, EventEmitter, FloatValue, IntegerValue, StringValue, ValueType } from '../../../../'

import { ColorValue } from '../../Values/ColorValue.js'
import { EulerValue } from '../../Values/EulerValue.js'
import { QuatValue } from '../../Values/QuatValue.js'
import { Vec2Value } from '../../Values/Vec2Value.js'
import { Vec3Value } from '../../Values/Vec3Value.js'
import { Vec4Value } from '../../Values/Vec4Value.js'
import { IScene } from '../IScene.js'

export class DummyScene implements IScene {
  public onSceneChanged = new EventEmitter<void>()

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
    // pull in value type nodes
  }

  getProperty(jsonPath: string, valueTypeName: string): any {
    return this.valueRegistry[valueTypeName]?.creator()
  }
  setProperty(): void {
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

  getProperties() {
    return []
  }

  addOnSceneChangedListener() {
    console.log('added on scene changed listener')
  }

  removeOnSceneChangedListener(): void {
    console.log('removed on scene changed listener')
  }
}
