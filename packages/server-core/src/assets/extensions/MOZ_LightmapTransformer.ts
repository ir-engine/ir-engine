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
  PropertyType,
  ReaderContext,
  WriterContext
} from '@gltf-transform/core'

const EXTENSION_NAME = 'MOZ_lightmap'

interface IMOZLightmap extends IProperty {
  index: number
  texCoord: number
  intensity: number
  extensions: Record<string, ExtensionProperty> | null
}

export class MOZLightmap extends ExtensionProperty<IMOZLightmap> {
  public static EXTENSION_NAME = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'Lightmap'
  public declare parentTypes: [PropertyType.MATERIAL]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'Lightmap'
    this.parentTypes = [PropertyType.MATERIAL]
  }

  protected getDefaults(): Nullable<IMOZLightmap> {
    return Object.assign(super.getDefaults() as IProperty, {
      index: -1,
      texCoord: 1,
      intensity: 1,
      extensions: {}
    })
  }

  public get intensity() {
    return this.get('intensity')
  }
  public set intensity(val: number) {
    this.set('intensity', val)
  }

  public get texCoord() {
    return this.get('texCoord')
  }
  public set texCoord(val: number) {
    this.set('texCoord', val)
  }

  public get index() {
    return this.get('index')
  }
  public set index(idx: number) {
    this.set('index', idx)
  }

  public get extensions(): Record<string, ExtensionProperty> | null {
    return this.get('extensions')
  }
  public set extensions(exts: Record<string, ExtensionProperty> | null) {
    this.set('extensions', exts)
  }
}

interface MozLightmapDef {
  index?: number
  texCoord?: number
  intensity?: number
  extensions?: Record<string, ExtensionProperty>
}

export class MOZLightmapExtension extends Extension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    const materialDefs = readerContext.jsonDoc.json.materials || []
    const textureDefs = readerContext.jsonDoc.json.textures || []
    materialDefs.forEach((def, idx) => {
      if (def.extensions && def.extensions[EXTENSION_NAME]) {
        const mozLightmap = new MOZLightmap(this.document.getGraph())
        readerContext.materials[idx].setExtension(EXTENSION_NAME, mozLightmap)

        const lightmapDef = def.extensions[EXTENSION_NAME] as MozLightmapDef

        if (lightmapDef.intensity !== undefined) {
          mozLightmap.intensity = lightmapDef.intensity
        }
        if (lightmapDef.index !== undefined) {
          mozLightmap.index = lightmapDef.index
        }
        if (lightmapDef.texCoord !== undefined) {
          mozLightmap.texCoord = lightmapDef.texCoord
        }
        if (lightmapDef.extensions !== undefined) {
          mozLightmap.extensions = lightmapDef.extensions
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
      .forEach((material) => {
        const mozLightmap = material.getExtension<MOZLightmap>(EXTENSION_NAME)
        if (mozLightmap) {
          const matIdx = writerContext.materialIndexMap.get(material)!
          const matDef = json.json.materials![matIdx]
          matDef.extensions = matDef.extensions ?? {}
          matDef.extensions[EXTENSION_NAME] = {
            intensity: mozLightmap.intensity,
            index: mozLightmap.index,
            texCoord: mozLightmap.texCoord,
            extensions: mozLightmap.extensions
          } as MozLightmapDef
        }
      })
    return this
  }
}
