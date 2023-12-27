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

import { Euler, MathUtils, Matrix4, Object3D, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'
import { Layer } from './ObjectLayerComponent'

let object3DId = 0

export const Object3DComponent = defineComponent({
  name: 'Object3DComponent',

  onInit(entity: Entity) {
    return {
      // Non mutable properties
      isObject3D: true,
      id: object3DId++,
      uuid: MathUtils.generateUUID(),
      type: 'Object3D',
      // Mutable properties
      name: '',
      parent: null,
      children: [],
      up: Object3D.DEFAULT_UP.clone(),
      position: new Vector3(),
      rotation: new Euler(),
      quaternion: new Quaternion(),
      scale: new Vector3(1, 1, 1),
      matrix: new Matrix4(),
      matrixWorld: new Matrix4(),
      matrixAutoUpdate: Object3D.DEFAULT_MATRIX_AUTO_UPDATE,
      matrixWorldAutoUpdate: Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, // checked by the rendere,
      matrixWorldNeedsUpdate: false,
      layers: new Layer(entity),
      visible: true,
      castShadow: false,
      receiveShadow: false,
      frustumCulled: true,
      renderOrder: 0,
      animations: [],
      userData: {}
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (json.name) component.name.set(json.name)
    if (json.parent) component.parent.set(json.parent)
    if (json.children) component.children.set(json.children)
    if (json.up) component.up.set(json.up)
    if (json.position) component.position.set(json.position)
    if (json.rotation) component.rotation.set(json.rotation)
    if (json.quaternion) component.quaternion.set(json.quaternion)
    if (json.scale) component.scale.set(json.scale)
    if (json.matrix) component.matrix.set(json.matrix)
    if (json.matrixWorld) component.matrixWorld.set(json.matrixWorld)
    if (json.matrixAutoUpdate) component.matrixAutoUpdate.set(json.matrixAutoUpdate)
    if (json.matrixWorldAutoUpdate) component.matrixWorldAutoUpdate.set(json.matrixWorldAutoUpdate)
    if (json.matrixWorldNeedsUpdate) component.matrixWorldNeedsUpdate.set(json.matrixWorldNeedsUpdate)
    if (json.layers) component.layers.set(json.layers)
    if (json.visible) component.visible.set(json.visible)
    if (json.castShadow) component.castShadow.set(json.castShadow)
    if (json.receiveShadow) component.receiveShadow.set(json.receiveShadow)
    if (json.frustumCulled) component.frustumCulled.set(json.frustumCulled)
    if (json.renderOrder) component.renderOrder.set(json.renderOrder)
    if (json.animations) component.animations.set(json.animations)
    if (json.userData) component.userData.set(json.userData)
  },

  toJSON(entity, component) {
    return {
      isObject3D: component.isObject3D.value,
      id: component.id.value,
      uuid: component.uuid.value,
      type: component.type.value,
      name: component.name.value,
      parent: component.parent.value,
      children: component.children.value,
      up: component.up.value,
      position: component.position.value,
      rotation: component.rotation.value,
      quaternion: component.quaternion.value,
      scale: component.scale.value,
      matrix: component.matrix.value,
      matrixWorld: component.matrixWorld.value,
      matrixAutoUpdate: component.matrixAutoUpdate.value,
      matrixWorldAutoUpdate: component.matrixWorldAutoUpdate.value,
      matrixWorldNeedsUpdate: component.matrixWorldNeedsUpdate.value,
      layers: component.layers.value,
      visible: component.visible.value,
      castShadow: component.castShadow.value,
      receiveShadow: component.receiveShadow.value,
      frustumCulled: component.frustumCulled.value,
      renderOrder: component.renderOrder.value,
      animations: component.animations.value,
      userData: component.userData.value
    }
  }
})
