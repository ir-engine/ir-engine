import {
  Extension,
  ExtensionProperty,
  IProperty,
  Nullable,
  PropertyType,
  ReaderContext,
  WriterContext
} from '@gltf-transform/core'

const EXTENSION_NAME = 'EE_material'

interface IEEMaterial extends IProperty {
  uuid: string
  name: string
  prototype: string
  args: { [field: string]: any }
}

export class EEMaterial extends ExtensionProperty {
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
      args: {}
    })
  }
}

export class EEMaterialExtension extends Extension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    const materialDefs = readerContext.jsonDoc.json.materials || []
    materialDefs.map((def, idx) => {
      if (def.extensions?.[EXTENSION_NAME]) {
        readerContext.materials[idx].setExtension(EXTENSION_NAME, new EEMaterial(this.document.getGraph()))
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
        const matIdx = writerContext.materialIndexMap.get(material)!
        const matDef = json.json.materials![matIdx]
        matDef.extensions = matDef.extensions || {}
      })
    return this
  }
}
