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

interface EEMaterialDef {
  uuid?: string
  name?: string
  prototype?: string
  args?: Record<string, any>
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
      args: {}
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
    return this.get('args')
  }
  public set args(val: { [field: string]: any }) {
    this.set('args', val)
  }
}

export class EEMaterialExtension extends Extension {
  public readonly extensionName = EXTENSION_NAME
  public static readonly EXTENSION_NAME = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    const materialDefs = readerContext.jsonDoc.json.materials || []
    materialDefs.map((def, idx) => {
      if (def.extensions?.[EXTENSION_NAME]) {
        const eeMaterial = new EEMaterial(this.document.getGraph())
        readerContext.materials[idx].setExtension(EXTENSION_NAME, new EEMaterial(this.document.getGraph()))

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
          eeMaterial.args = eeDef.args
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
          matDef.extensions = matDef.extensions || {}
          matDef.extensions[EXTENSION_NAME] = {
            uuid: eeMaterial.uuid,
            name: eeMaterial.name,
            prototype: eeMaterial.prototype,
            args: eeMaterial.args
          } as EEMaterialDef
        }
      })
    return this
  }
}
