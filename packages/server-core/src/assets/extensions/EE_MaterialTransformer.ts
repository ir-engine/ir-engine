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
  Texture,
  TextureInfo,
  WriterContext
} from '@gltf-transform/core'

import { KHRTextureTransform } from '@gltf-transform/extensions'

const EXTENSION_NAME = 'EE_material'

interface IEEArgEntry extends IProperty {
  type: string
  contents: any
}

interface IEEArgs extends IProperty {
  [field: string]: any
}

interface IEEMaterial extends IProperty {
  uuid: string
  name: string
  prototype: string
  args: EEMaterialArgs
  plugins: string[]
}

interface EEArgsDef {
  type?: string
  contents?: any
}

interface EEArgs {
  [field: string]: EEArgsDef
}

interface EEMaterialDef {
  uuid?: string
  name?: string
  prototype?: string
  args?: EEArgs
  plugins?: string[]
}

export class EEMaterialArgs extends Property<IEEArgs> {
  public declare propertyType: 'EEMaterialArgs'
  public declare parentTypes: ['EEMaterial']
  protected init(): void {
    this.propertyType = 'EEMaterialArgs'
    this.parentTypes = ['EEMaterial']
  }

  protected getDefaults(): Nullable<IEEArgs> {
    return Object.assign(super.getDefaults() as IProperty, {
      extras: {}
    })
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

export class EEArgEntry extends Property<IEEArgEntry> {
  public declare propertyType: 'EEMaterialArgEntry'
  public declare parentTypes: ['EEMaterialArgs']
  protected init(): void {
    this.propertyType = 'EEMaterialArgEntry'
    this.parentTypes = ['EEMaterialArgs']
  }

  protected getDefaults(): Nullable<IEEArgEntry> {
    return Object.assign(super.getDefaults() as IProperty, {
      name: '',
      type: '',
      contents: null,
      extras: {}
    })
  }

  public get type() {
    return this.get('type')
  }
  public set type(val: string) {
    this.set('type', val)
  }
  public get contents() {
    return this.get('contents')
  }
  public set contents(val) {
    this.set('contents', val)
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

  textureInfoMap: Map<string, TextureInfo> = new Map()
  materialInfoMap: Map<string, string[]> = new Map()
  public read(readerContext: ReaderContext): this {
    const materialDefs = readerContext.jsonDoc.json.materials || []
    let textureUuidIndex = 0
    let materialUuidIndex = 0
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
          const materialArgsInfo = Object.keys(eeDef.args)
          const materialUuid = materialUuidIndex.toString()
          this.materialInfoMap.set(materialUuid, materialArgsInfo)
          processedArgs.setExtras({ uuid: materialUuid })
          Object.entries(eeDef.args).map(([field, argDef]) => {
            const nuArgDef = new EEArgEntry(this.document.getGraph())
            nuArgDef.type = argDef.type!
            if (argDef.type === 'texture') {
              const value = argDef.contents
              const texture = value ? readerContext.textures[value.index] : null
              if (texture) {
                const textureInfo = new TextureInfo(this.document.getGraph())
                readerContext.setTextureInfo(textureInfo, value)
                if (texture && value.extensions?.KHR_texture_transform) {
                  const extensionData = value.extensions.KHR_texture_transform
                  const transform = new KHRTextureTransform(this.document).createTransform()
                  extensionData.offset && transform.setOffset(extensionData.offset)
                  extensionData.scale && transform.setScale(extensionData.scale)
                  extensionData.rotation && transform.setRotation(extensionData.rotation)
                  extensionData.texCoord && transform.setTexCoord(extensionData.texCoord)
                  textureInfo.setExtension('KHR_texture_transform', transform)
                }
                const uuid = textureUuidIndex.toString()
                textureUuidIndex++
                texture.setExtras({ uuid })
                this.textureInfoMap.set(uuid, textureInfo)
              }
              nuArgDef.contents = texture
              processedArgs.setPropRef(field, nuArgDef)
            } else {
              nuArgDef.contents = argDef.contents
              processedArgs.setProp(field, nuArgDef)
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
            const materialArgsInfo = this.materialInfoMap.get(matArgs.getExtras().uuid as string)!
            materialArgsInfo.map((field) => {
              let value: EEArgEntry
              try {
                value = matArgs.getPropRef(field) as EEArgEntry
              } catch (e) {
                value = matArgs.getProp(field) as EEArgEntry
              }
              if (value.type === 'texture') {
                const argEntry = new EEArgEntry(this.document.getGraph())
                argEntry.type = 'texture'
                const texture = value.contents as Texture
                if (texture) {
                  const uuid = texture.getExtras().uuid as string
                  const textureInfo = this.textureInfoMap.get(uuid)!

                  argEntry.contents = writerContext.createTextureInfoDef(texture, textureInfo)
                } else {
                  argEntry.contents = null
                }
                extensionDef.args![field] = argEntry
              } else {
                extensionDef.args![field] = value
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
