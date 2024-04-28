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

import {
  Entity,
  EntityUUID,
  UUIDComponent,
  createEntity,
  generateEntityUUID,
  getComponent,
  setComponent
} from '@etherealengine/ecs'
import { isArray } from 'lodash'
import { Color, Mesh, Texture } from 'three'
import { NameComponent } from '../../common/NameComponent'
import { PluginObjectType } from '../../common/functions/OnBeforeCompilePlugin'
import { GroupComponent } from '../components/GroupComponent'
import {
  MaterialComponent,
  MaterialComponents,
  MaterialPrototypeConstructor,
  MaterialPrototypeObjectConstructor,
  PrototypeArgument,
  prototypeByName
} from './MaterialComponent'

export const extractDefaults = (defaultArgs) => {
  return formatMaterialArgs(
    Object.fromEntries(Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, v.default])),
    defaultArgs
  )
}

export const formatMaterialArgs = (args, defaultArgs: any = undefined) => {
  if (!args) return args
  return Object.fromEntries(
    Object.entries(args)
      .map(([k, v]: [string, any]) => {
        if (!!defaultArgs && defaultArgs[k]) {
          switch (defaultArgs[k].type) {
            case 'color':
              return [k, v ? ((v as Color).isColor ? v : new Color(v)) : undefined]
          }
        }
        const tex = v as Texture
        if (tex?.isTexture) {
          if (tex.source.data !== undefined) {
            return [k, v]
          }
          return [k, undefined]
        }
        if (v === '') return [k, undefined]
        return [k, v]
      })
      .filter(([_, v]) => v !== undefined)
  )
}

export const createPrototype = (
  name: string,
  prototypeArguments: PrototypeArgument,
  prototypeConstructor: MaterialPrototypeConstructor
) => {
  const prototypeEntity = createEntity()
  const prototypeObject = {} as MaterialPrototypeObjectConstructor
  prototypeObject[name] = prototypeConstructor
  setComponent(prototypeEntity, MaterialComponent[MaterialComponents.MaterialPrototype], {
    prototypeConstructor: prototypeObject,
    prototypeArguments
  })
  setComponent(prototypeEntity, NameComponent, name)
  setComponent(prototypeEntity, UUIDComponent, generateEntityUUID())
  /**@todo handle duplicate prototype names */
  if (prototypeByName[name]) throw new Error('Prototype already exists')
  prototypeByName[name] = prototypeEntity
}

export const createPlugin = (plugin: PluginObjectType) => {
  const pluginEntity = createEntity()
  setComponent(pluginEntity, MaterialComponent[MaterialComponents.MaterialPlugin], { plugin: plugin })
  setComponent(pluginEntity, NameComponent, plugin.id)
  setComponent(pluginEntity, UUIDComponent, generateEntityUUID())
}

export const getMaterial = (uuid: EntityUUID) => {
  return getComponent(UUIDComponent.getEntityByUUID(uuid), MaterialComponent[MaterialComponents.MaterialState])
    .material!
}

export const setGroupMaterial = (groupEntity: Entity, newMaterialUUIDs: EntityUUID[]) => {
  const mesh = getComponent(groupEntity, GroupComponent)[0] as Mesh
  if (!isArray(mesh.material)) mesh.material = getMaterial(newMaterialUUIDs[0])! ?? mesh.material
  else
    for (let i = 0; i < mesh.material.length; i++)
      mesh.material[i] = getMaterial(newMaterialUUIDs[i])! ?? mesh.material[i]
}
