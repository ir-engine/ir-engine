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

import { Object3D } from 'three'

import { Engine } from '../../ecs/classes/Engine'
import { ObjectLayers } from '../constants/ObjectLayers'

export function updateWorldObjectLayers(object: Object3D) {
  for (const layerKey of Object.keys(ObjectLayers)) {
    const layer = ObjectLayers[layerKey]
    const hasLayer = object.layers.isEnabled(layer)
    Engine.instance.objectLayerList[layer] = Engine.instance.objectLayerList[layer] || new Set()
    if (hasLayer) Engine.instance.objectLayerList[layer].add(object)
    else Engine.instance.objectLayerList[layer].delete(object)
  }
}

export function setObjectLayers(object: Object3D, ...layers: number[]) {
  object.traverse((obj: Object3D) => {
    obj.layers.disableAll()
    for (const layer of layers) {
      obj.layers.enable(layer)
    }
  })
  updateWorldObjectLayers(object)
}

export function enableObjectLayer(object: Object3D, layer: number, enable: boolean) {
  object.traverse((obj: Object3D) => {
    enable ? obj.layers.enable(layer) : obj.layers.disable(layer)
  })
  updateWorldObjectLayers(object)
}
