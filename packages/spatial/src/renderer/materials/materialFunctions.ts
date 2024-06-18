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

import { isArray } from 'lodash'
import { Color, Material, Mesh, Texture } from 'three'

import {
  createEntity,
  Entity,
  EntityUUID,
  generateEntityUUID,
  getComponent,
  setComponent,
  UUIDComponent
} from '@etherealengine/ecs'

import { NameComponent } from '../../common/NameComponent'
import { MeshComponent } from '../components/MeshComponent'
import {
  MaterialPrototypeComponent,
  MaterialPrototypeDefinition,
  MaterialPrototypeObjectConstructor,
  MaterialStateComponent
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

export const createMaterialPrototype = (prototype: MaterialPrototypeDefinition) => {
  const prototypeEntity = createEntity()
  const prototypeObject = {} as MaterialPrototypeObjectConstructor
  prototypeObject[prototype.prototypeId] = prototype.prototypeConstructor
  setComponent(prototypeEntity, MaterialPrototypeComponent, {
    prototypeConstructor: prototypeObject,
    prototypeArguments: prototype.arguments
  })
  setComponent(prototypeEntity, NameComponent, prototype.prototypeId)
  setComponent(prototypeEntity, UUIDComponent, generateEntityUUID())
}

export const getMaterial = (uuid: EntityUUID) => {
  return getComponent(UUIDComponent.getEntityByUUID(uuid), MaterialStateComponent).material! as Material
}

export const setMeshMaterial = (groupEntity: Entity, newMaterialUUIDs: EntityUUID[]) => {
  const mesh = getComponent(groupEntity, MeshComponent) as Mesh
  if (!isArray(mesh.material)) mesh.material = getMaterial(newMaterialUUIDs[0])! ?? mesh.material
  else
    for (let i = 0; i < mesh.material.length; i++)
      mesh.material[i] = getMaterial(newMaterialUUIDs[i])! ?? mesh.material[i]
}

export const setPlugin = (material: Material, callback) => {
  if (hasPlugin(material, callback)) removePlugin(material, callback)
  material.onBeforeCompile = callback
  material.needsUpdate = true
}

export const hasPlugin = (material: Material, callback) =>
  material.plugins?.length && !!material.plugins.find((plugin) => plugin.toString() === callback.toString())

export const removePlugin = (material: Material, callback) => {
  const pluginIndex = material.plugins?.findIndex((plugin) => plugin === callback)
  if (pluginIndex !== undefined) material.plugins?.splice(pluginIndex, 1)
}

/**Updates the material entity's threejs material prototype to match its
 * current prototype entity */
export const updateMaterialPrototype = (materialEntity: Entity) => {
  const materialComponent = getComponent(materialEntity, MaterialStateComponent)
  const prototypeEntity = materialComponent.prototypeEntity!
  const prototypeName = getComponent(prototypeEntity, NameComponent)
  const prototypeComponent = getComponent(prototypeEntity, MaterialPrototypeComponent)
  const prototypeConstructor = prototypeComponent.prototypeConstructor![prototypeName]
  if (!prototypeConstructor || !prototypeComponent.prototypeArguments) return
  const material = materialComponent.material
  if (!material || material.type === prototypeName) return
  const fullParameters = { ...extractDefaults(prototypeComponent.prototypeArguments) }
  const newMaterial = new prototypeConstructor(fullParameters)
  if (newMaterial.plugins) {
    newMaterial.customProgramCacheKey = () =>
      newMaterial.plugins!.map((plugin) => plugin.toString()).reduce((x, y) => x + y, '')
  }
  newMaterial.uuid = material.uuid
  if (material.defines?.['USE_COLOR']) {
    newMaterial.defines = newMaterial.defines ?? {}
    newMaterial.defines!['USE_COLOR'] = material.defines!['USE_COLOR']
  }
  newMaterial.userData = {
    ...newMaterial.userData,
    ...Object.fromEntries(Object.entries(material.userData).filter(([k, v]) => k !== 'type'))
  }
  setComponent(materialEntity, MaterialStateComponent, {
    material: newMaterial,
    parameters: fullParameters
  })

  return newMaterial
}
