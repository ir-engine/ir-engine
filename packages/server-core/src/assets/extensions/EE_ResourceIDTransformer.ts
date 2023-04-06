import {
  Extension,
  ExtensionProperty,
  IProperty,
  Nullable,
  Property,
  PropertyType,
  ReaderContext,
  WriterContext
} from '@gltf-transform/core'

import { ResourceID } from '@etherealengine/engine/src/assets/classes/ModelTransform'

const EXTENSION_NAME = 'EE_resourceID'

interface IEEResourceID extends IProperty {
  resourceId: ResourceID
}

interface EEResourceIDDef {
  resourceId?: ResourceID
}

export class EEResourceID extends ExtensionProperty<IEEResourceID> {
  public static EXTENSION_NAME: string = EXTENSION_NAME
  public declare extensionName: typeof EXTENSION_NAME
  public declare propertyType: 'EEResourceID'
  public declare parentTypes: [PropertyType.TEXTURE, PropertyType.PRIMITIVE]

  protected init(): void {
    this.extensionName = EXTENSION_NAME
    this.propertyType = 'EEResourceID'
    this.parentTypes = [PropertyType.TEXTURE, PropertyType.PRIMITIVE]
  }

  protected getDefaults(): Nullable<IEEResourceID> {
    return Object.assign(super.getDefaults() as IProperty, {
      resourceId: '' as ResourceID
    })
  }

  public get resourceId(): ResourceID {
    return this.get('resourceId')
  }

  public set resourceId(resourceId: ResourceID) {
    this.set('resourceId', resourceId)
  }
}

export class EEResourceIDExtension extends Extension {
  public readonly extensionName: string = EXTENSION_NAME
  public static readonly EXTENSION_NAME: string = EXTENSION_NAME

  public read(readerContext: ReaderContext): this {
    const jsonDoc = readerContext.jsonDoc
    ;(jsonDoc.json.textures || []).map((def, idx) => {
      if (def.extensions?.[EXTENSION_NAME]) {
        const eeResourceID = new EEResourceID(this.document.getGraph())
        readerContext.textures[idx].setExtension(EXTENSION_NAME, eeResourceID)
        const eeDef = def.extensions[EXTENSION_NAME] as EEResourceIDDef
        eeDef.resourceId && (eeResourceID.resourceId = eeDef.resourceId)
      }
    })
    return this
  }

  public write(writerContext: WriterContext): this {
    const jsonDoc = writerContext.jsonDoc
    this.document
      .getRoot()
      .listTextures()
      .map((texture, index) => {
        const eeResourceID = texture.getExtension(EXTENSION_NAME) as EEResourceID
        if (!eeResourceID) return
        const textureDef = jsonDoc.json.textures![index]
      })
    return this
  }
}
