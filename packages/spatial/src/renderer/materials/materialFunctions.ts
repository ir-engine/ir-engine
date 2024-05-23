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
import { Color, Material, Mesh, Shader, Texture, Uniform } from 'three'

import {
  createEntity,
  Entity,
  EntityUUID,
  generateEntityUUID,
  getComponent,
  getMutableComponent,
  getOptionalMutableComponent,
  setComponent,
  UUIDComponent
} from '@etherealengine/ecs'

import { addOBCPlugin, hasOBCPlugin, PluginObjectType } from '../../common/functions/OnBeforeCompilePlugin'
import { NameComponent } from '../../common/NameComponent'
import { GroupComponent } from '../components/GroupComponent'
import {
  MaterialComponent,
  MaterialComponents,
  MaterialPrototypeDefinition,
  MaterialPrototypeObjectConstructor,
  pluginByName,
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

export const createMaterialPrototype = (prototype: MaterialPrototypeDefinition) => {
  const prototypeEntity = createEntity()
  const prototypeObject = {} as MaterialPrototypeObjectConstructor
  prototypeObject[prototype.prototypeId] = prototype.prototypeConstructor
  setComponent(prototypeEntity, MaterialComponent[MaterialComponents.Prototype], {
    prototypeConstructor: prototypeObject,
    prototypeArguments: prototype.arguments
  })
  setComponent(prototypeEntity, NameComponent, prototype.prototypeId)
  setComponent(prototypeEntity, UUIDComponent, generateEntityUUID())
  prototypeByName[prototype.prototypeId] = prototypeEntity
}

export const createMaterialPlugin = (plugin: PluginObjectType) => {
  const pluginEntity = createEntity()
  setComponent(pluginEntity, MaterialComponent[MaterialComponents.Plugin], { plugin })
  setComponent(pluginEntity, NameComponent, plugin.id)
  setComponent(pluginEntity, UUIDComponent, generateEntityUUID())
  pluginByName[plugin.id] = pluginEntity
}

export const addMaterialPlugin = (materialEntity: Entity, pluginEntity: Entity) => {
  const materialComponent = getComponent(materialEntity, MaterialComponent[MaterialComponents.State])
  materialComponent.material?.shader
  setComponent(materialEntity, MaterialComponent[MaterialComponents.Plugin], {
    pluginEntities: [...(materialComponent.pluginEntities ?? []), pluginEntity]
  })
}

export const getPluginObject = (pluginId: string) => {
  const pluginEntity = pluginByName[pluginId]
  const plugin = getOptionalMutableComponent(pluginEntity, MaterialComponent[MaterialComponents.Plugin])?.plugin
  return plugin
}

export const applyMaterialPlugins = (materialEntity: Entity) => {
  const materialComponent = getComponent(materialEntity, MaterialComponent[MaterialComponents.State])
  const material = materialComponent.material as Material
  material.shader.uuid = material.uuid as EntityUUID
  if (!materialComponent.pluginEntities || !material) return
  for (const pluginEntity of materialComponent.pluginEntities) {
    const pluginComponent = getComponent(pluginEntity, MaterialComponent[MaterialComponents.Plugin])
    if (pluginComponent.plugin) {
      if (hasOBCPlugin(material, pluginComponent.plugin)) return
      addOBCPlugin(material, pluginComponent.plugin)
    }
  }
}

export const applyPluginShaderParameters = (
  pluginEntity: Entity,
  shader: Shader,
  parameters: { [key: string]: any }
) => {
  const pluginComponent = getMutableComponent(pluginEntity, MaterialComponent[MaterialComponents.Plugin])
  const name = (shader as any).shaderName
  if (!pluginComponent.parameters[name].value) pluginComponent.parameters[name].set({})
  const parameterObject = pluginComponent.parameters[name]
  for (const key in parameters) {
    const parameterExists = !!parameterObject[key].value
    if (!parameterExists) parameterObject[key].set(new Uniform(parameters[key]))
    shader.uniforms[key] = parameterObject[key].value
  }
}

export const getMaterial = (uuid: EntityUUID) => {
  return getComponent(UUIDComponent.getEntityByUUID(uuid), MaterialComponent[MaterialComponents.State])
    .material! as Material
}

export const setGroupMaterial = (groupEntity: Entity, newMaterialUUIDs: EntityUUID[]) => {
  const mesh = getComponent(groupEntity, GroupComponent)[0] as Mesh
  if (!isArray(mesh.material)) mesh.material = getMaterial(newMaterialUUIDs[0])! ?? mesh.material
  else
    for (let i = 0; i < mesh.material.length; i++)
      mesh.material[i] = getMaterial(newMaterialUUIDs[i])! ?? mesh.material[i]
}

/**Updates the material entity's threejs material prototype to match its current prototype entity */
export const updateMaterialPrototype = (materialEntity: Entity) => {
  const materialComponent = getComponent(materialEntity, MaterialComponent[MaterialComponents.State])
  const prototypeEntity = materialComponent.prototypeEntity!
  const prototypeName = getComponent(prototypeEntity, NameComponent)
  const prototypeComponent = getComponent(prototypeEntity, MaterialComponent[MaterialComponents.Prototype])
  const prototypeConstructor = prototypeComponent.prototypeConstructor![prototypeName]
  if (!prototypeConstructor || !prototypeComponent.prototypeArguments) return
  const material = materialComponent.material
  if (!material || material.type === prototypeName) return
  const matKeys = Object.keys(material)
  const commonParameters = Object.fromEntries(
    Object.keys(prototypeComponent.prototypeArguments)
      .filter((key) => matKeys.includes(key))
      .map((key) => [key, material[key]])
  )
  const fullParameters = { ...extractDefaults(prototypeComponent.prototypeArguments), ...commonParameters }
  const newMaterial = new prototypeConstructor(fullParameters)
  if (newMaterial.plugins) {
    newMaterial.customProgramCacheKey = () =>
      newMaterial.plugins!.map((plugin) => plugin.toString()).reduce((x, y) => x + y, '')
  }
  newMaterial.uuid = material.uuid
  newMaterial.name = material.name
  newMaterial.type = prototypeName
  if (material.defines?.['USE_COLOR']) {
    newMaterial.defines = newMaterial.defines ?? {}
    newMaterial.defines!['USE_COLOR'] = material.defines!['USE_COLOR']
  }
  newMaterial.userData = {
    ...newMaterial.userData,
    ...Object.fromEntries(Object.entries(material.userData).filter(([k, v]) => k !== 'type'))
  }
  setComponent(materialEntity, MaterialComponent[MaterialComponents.State], {
    material: newMaterial,
    parameters: fullParameters
  })
  return newMaterial
}
