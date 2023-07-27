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
