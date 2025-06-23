/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  Extension,
  ExtensionProperty,
  Nullable,
  PropertyType,
  ReaderContext,
  WebIO,
  WriterContext
} from '@gltf-transform/core'
import {
  EXTMeshGPUInstancing,
  EXTMeshoptCompression,
  KHRDracoMeshCompression,
  KHRLightsPunctual,
  KHRMaterialsClearcoat,
  KHRMaterialsEmissiveStrength,
  KHRMaterialsPBRSpecularGlossiness,
  KHRMaterialsSpecular,
  KHRMaterialsTransmission,
  KHRMaterialsUnlit,
  KHRMeshQuantization,
  KHRTextureBasisu,
  KHRTextureTransform
} from '@gltf-transform/extensions'
import {
  ComponentJSONIDMap,
  ComponentType,
  CreateSchemaValue,
  EntityTreeComponent,
  GenerateJSONSchema,
  JSONSchema,
  UUIDComponent
} from '@ir-engine/ecs'
import { EEMaterialExtension } from '@ir-engine/engine/src/assets/compression/extensions/EE_MaterialTransformer'
import { VRMExtension } from '@ir-engine/engine/src/assets/compression/extensions/EE_VRMTransformer'
import { MOZLightmapExtension } from '@ir-engine/engine/src/assets/compression/extensions/MOZ_LightmapTransformer'
import { TransformComponent } from '@ir-engine/spatial'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import {
  MaterialPluginComponents,
  MaterialStateComponent
} from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import draco3d from 'draco3dgltf'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'
import { FileLoader } from 'three'

const ignoreComponents = [
  NameComponent.jsonID,
  MaterialStateComponent.jsonID,
  EntityTreeComponent.jsonID,
  TransformComponent.jsonID
]
const coreComponents = [UUIDComponent.jsonID]

export const createComponentExtension = (component: ComponentType<any>) => {
  const componentSchema = component.schema ? GenerateJSONSchema(component.schema) : ({} as JSONSchema)

  const propertyTypes: PropertyType[] = coreComponents.includes(component.jsonID)
    ? [PropertyType.MATERIAL, PropertyType.NODE]
    : Object.keys(MaterialPluginComponents).includes(component.jsonID)
    ? [PropertyType.MATERIAL]
    : [PropertyType.NODE]

  class ComponentExtensionProperty extends ExtensionProperty {
    public static EXTENSION_NAME = component.jsonID
    public declare extensionName: typeof component.jsonID
    public declare propertyType: typeof component.name
    public declare parentTypes: PropertyType[]

    protected init(): void {
      this.extensionName = component.jsonID
      this.propertyType = component.name
      this.parentTypes = propertyTypes
    }

    protected getDefaults(): Nullable<any> {
      return Object.assign(component.schema ? CreateSchemaValue(component.schema) : {})
    }
  }

  if (componentSchema?.type === 'Object' && componentSchema.properties) {
    for (const prop of Object.keys(componentSchema?.properties)) {
      Object.assign(ComponentExtensionProperty.prototype, {
        get [prop]() {
          return this.get(prop)
        },
        set [prop](val: string) {
          this.set(prop, val)
        }
      })
    }
  }

  class ComponentExtension extends Extension {
    public readonly extensionName = component.jsonID
    public static readonly EXTENSION_NAME = component.jsonID
    read(readerContext: ReaderContext): this {
      const nodeDefs = readerContext.jsonDoc.json.nodes || []
      nodeDefs.forEach((def, idx) => {
        if (def.extensions?.[component.jsonID]) {
          const extensionGraphNode = new ComponentExtensionProperty(this.document.getGraph())
          readerContext.nodes[idx].setExtension(component.jsonID, extensionGraphNode)

          const extensionDef = def.extensions[component.jsonID] as ComponentExtensionProperty
          if (componentSchema?.type === 'object' && componentSchema.properties) {
            for (const prop of Object.keys(componentSchema?.properties)) {
              if (extensionDef[prop] !== undefined) {
                extensionGraphNode[prop] = extensionDef[prop]
              }
            }
          }
        }
      })
      return this
    }

    public write(writerContext: WriterContext): this {
      const json = writerContext.jsonDoc
      this.document
        .getRoot()
        .listNodes()
        .forEach((node) => {
          const extensionDef = node.getExtension<ComponentExtensionProperty>(component.jsonID)
          if (extensionDef) {
            const nodeIdx = writerContext.nodeIndexMap.get(node)!
            const nodeDef = json.json.nodes![nodeIdx]
            nodeDef.extensions = nodeDef.extensions || {}

            nodeDef.extensions[component.jsonID] =
              componentSchema?.type === 'object' && componentSchema.properties
                ? Object.fromEntries(Object.keys(componentSchema?.properties).map((key) => [key, extensionDef[key]]))
                : {}
          }
        })
      return this
    }
  }

  return ComponentExtension
}

const transformHistory: string[] = []
export default async function ModelTransformLoader() {
  const io = new WebIO()
  const nonComponentExtensions = [
    KHRLightsPunctual,
    KHRMaterialsSpecular,
    KHRMaterialsClearcoat,
    KHRMaterialsPBRSpecularGlossiness,
    KHRMaterialsUnlit,
    KHRMaterialsEmissiveStrength,
    KHRMaterialsTransmission,
    KHRDracoMeshCompression,
    EXTMeshGPUInstancing,
    EXTMeshoptCompression,
    KHRMeshQuantization,
    KHRTextureBasisu,
    KHRTextureTransform,
    MOZLightmapExtension,
    EEMaterialExtension,
    VRMExtension
  ]
  io.registerExtensions(nonComponentExtensions)
  for (const component of [...ComponentJSONIDMap.values()]) {
    if (!component.jsonID) continue
    if (nonComponentExtensions.find((e) => e.EXTENSION_NAME === component.jsonID)) continue
    if (ignoreComponents.includes(component.jsonID)) continue
    io.registerExtensions([createComponentExtension(component)])
  }
  io.registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
    'draco3d.decoder': await draco3d.createDecoderModule(),
    'draco3d.encoder': await draco3d.createEncoderModule()
  })
  return {
    io,
    load: async (src, noHistory = false) => {
      const loader = new FileLoader()
      loader.setResponseType('arraybuffer')
      const data = (await loader.loadAsync(src)) as ArrayBuffer
      if (!noHistory) transformHistory.push(src)
      return io.readBinary(new Uint8Array(data))
    },
    //load: io.read,
    get prev(): string | undefined {
      return transformHistory.length > 0 ? transformHistory[0] : undefined
    }
  }
}
