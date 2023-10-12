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
  ComponentMap,
  getComponent,
  getMutableComponent,
  hasComponent
} from '../../../../ecs/functions/ComponentFunctions'
import { GLTFLoadedComponent } from '../../../../scene/components/GLTFLoadedComponent'
import { Object3DWithEntity } from '../../../../scene/components/GroupComponent'
import { NameComponent } from '../../../../scene/components/NameComponent'
import { GLTFExporterPlugin } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export class EEECSExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  name = 'EE_ecs'

  writeNode(object: Object3DWithEntity, nodeDef: { [key: string]: any }) {
    if (!object.entity) return
    const entity = object.entity
    if (!hasComponent(entity, GLTFLoadedComponent)) return
    const gltfLoaded = getComponent(entity, GLTFLoadedComponent)
    const data = new Array<[string, any]>()
    for (const field of gltfLoaded) {
      if (field === 'entity') {
        const name = getComponent(entity, NameComponent)
        data.push(['xrengine.entity', name])
      } else {
        const component = ComponentMap.get(field)!
        if (!component?.toJSON) {
          console.error(`[EEECSExporter]: Component ${field} does not have a toJSON method`)
          continue
        }
        const compData = component.toJSON(entity, getMutableComponent(entity, component))
        for (const [field, value] of Object.entries(compData)) {
          data.push([`xrengine.${component.name}.${field}`, value])
        }
      }
    }
    nodeDef.extensions = nodeDef.extensions ?? {}
    nodeDef.extensions[this.name] = { data }
    this.writer.extensionsUsed[this.name] = true
  }
}
