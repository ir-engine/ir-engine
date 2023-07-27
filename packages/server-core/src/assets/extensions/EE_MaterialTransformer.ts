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
  Extension,
  ExtensionProperty,
  IProperty,
  Nullable,
  Property,
  PropertyType,
  ReaderContext,
  TextureInfo,
  WriterContext
} from '@gltf-transform/core'

import { prototypeFromId } from '@etherealengine/engine/src/renderer/materials/functions/MaterialLibraryFunctions'
import { initializeMaterialLibrary } from '@etherealengine/engine/src/renderer/materials/MaterialLibrary'

const EXTENSION_NAME = 'EE_material'

interface IEEMaterialArgs extends IProperty {
  [field: string]: any
}

interface IEEMaterial extends IProperty {
  uuid: string
  name: string
  prototype: string
  args: EEMaterialArgs
  plugins: string[]
}

interface EEMaterialDef {
  uuid?: string
  name?: string
  prototype?: string
  args?: Record<string, any>
  plugins?: string[]
}

export class EEMaterialArgs extends Property<IEEMaterialArgs> {
  public declare propertyType: 'EEMaterial-Arguments'
  protected init(): Nullable<IEEMaterialArgs> {
    return {
      name: '',
      extras: {}
    }
  }

  public getProp(field: string) {
    return this.get(field)
  }

  public getPropRef(field: string) {
    return this.getRef(field)
  }

  public setProp(field: string, value: any) {
    this.set(field, value)
  }
  public setPropRef(field: string, value: any) {
    this.setRef(field, value)
  }
}

export class EEMaterial extends ExtensionProperty<IEEMaterial> {
  public static EXTENSION_NAME = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'EEMaterial'
  public declare parentTypes: [PropertyType.MATERIAL]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'EEMaterial'
    this.parentTypes = [PropertyType.MATERIAL]
  }

  protected getDefaults(): Nullable<IEEMaterial> {
    return Object.assign(super.getDefaults() as IProperty, {
      uuid: '',
      name: '',
      prototype: '',
      args: null,
      plugins: []
    })
  }

  public get uuid() {
    return this.get('uuid')
  }
  public set uuid(val: string) {
    this.set('uuid', val)
  }
  public get name() {
    return this.get('name')
  }
  public set name(val: string) {
    this.set('name', val)
  }
  public get prototype() {
    return this.get('prototype')
  }
  public set prototype(val: string) {
    this.set('prototype', val)
  }
  public get args() {
    return this.getRef('args')
  }
  public set args(val) {
    this.setRef('args', val)
  }
  public get plugins() {
    return this.get('plugins')
  }
  public set plugins(val: string[]) {
    this.set('plugins', val)
  }
}

export class EEMaterialExtension extends Extension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    initializeMaterialLibrary()
    const materialDefs = readerContext.jsonDoc.json.materials || []
    materialDefs.map((def, idx) => {
      if (def.extensions?.[EXTENSION_NAME]) {
        const eeMaterial = new EEMaterial(this.document.getGraph())
        readerContext.materials[idx].setExtension(EXTENSION_NAME, eeMaterial)

        const eeDef = def.extensions[EXTENSION_NAME] as EEMaterialDef

        if (eeDef.uuid) {
          eeMaterial.uuid = eeDef.uuid
        }
        if (eeDef.name) {
          eeMaterial.name = eeDef.name
        }
        if (eeDef.prototype) {
          eeMaterial.prototype = eeDef.prototype
        }
        if (eeDef.args) {
          //eeMaterial.args = eeDef.args
          const processedArgs = new EEMaterialArgs(this.document.getGraph())
          const defaultArgs = prototypeFromId(eeDef.prototype!).arguments
          Object.entries(eeDef.args).map(([field, value]) => {
            if (!defaultArgs[field]) {
              return //ignore deprecated fields
            }
            if (defaultArgs[field].type === 'texture') {
              processedArgs.setPropRef(field, value ? readerContext.textures[value.index] : null)
            } else {
              processedArgs.setProp(field, value)
            }
          })
          eeMaterial.args = processedArgs
        }
        if (eeDef.plugins) {
          eeMaterial.plugins = eeDef.plugins
        }
      }
    })
    return this
  }

  public write(writerContext: WriterContext): this {
    const json = writerContext.jsonDoc
    this.document
      .getRoot()
      .listMaterials()
      .map((material) => {
        const eeMaterial = material.getExtension<EEMaterial>(EXTENSION_NAME)
        if (eeMaterial) {
          const matIdx = writerContext.materialIndexMap.get(material)!
          const matDef = json.json.materials![matIdx]
          const extensionDef: EEMaterialDef = {
            uuid: eeMaterial.uuid,
            name: eeMaterial.name,
            prototype: eeMaterial.prototype,
            plugins: eeMaterial.plugins
          }
          const matArgs = eeMaterial.args
          if (matArgs) {
            extensionDef.args = {}
            const defaultArgs = prototypeFromId(eeMaterial.prototype).arguments
            Object.entries(defaultArgs).map(([field, value]) => {
              if (value.type === 'texture') {
                const texture = matArgs.getPropRef(field)
                if (texture) {
                  const textureInfo = new TextureInfo(this.document.getGraph())
                  extensionDef.args![field] = writerContext.createTextureInfoDef(texture, textureInfo)
                } else {
                  extensionDef.args![field] = null
                }
              } else {
                extensionDef.args![field] = matArgs.getProp(field)
              }
            })
          }
          matDef.extensions = matDef.extensions || {}
          matDef.extensions[EXTENSION_NAME] = extensionDef
        }
      })
    return this
  }
}
