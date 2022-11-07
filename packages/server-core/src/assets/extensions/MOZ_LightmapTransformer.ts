import {
  Extension,
  ExtensionProperty,
  GLTF,
  IProperty,
  Nullable,
  PropertyType,
  ReaderContext,
  Texture,
  TextureInfo,
  vec2,
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
