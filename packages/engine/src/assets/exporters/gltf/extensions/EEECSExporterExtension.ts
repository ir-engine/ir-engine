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
  getAllComponents,
  getComponent,
  getMutableComponent,
  hasComponent
} from '../../../../ecs/functions/ComponentFunctions'
import { Object3D } from '../../../../scene/components/GroupComponent'
import { NameComponent } from '../../../../scene/components/NameComponent'
import { SceneObjectComponent } from '../../../../scene/components/SceneObjectComponent'
import { LocalTransformComponent, TransformComponent } from '../../../../transform/components/TransformComponent'
import { GLTFExporterPlugin } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export class EEECSExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  name = 'EE_ecs'

  writeNode(object: Object3D, nodeDef: { [key: string]: any }) {
    if (!object.entity) return
    const entity = object.entity
    if (!hasComponent(entity, SceneObjectComponent)) return
    //const gltfLoaded = getComponent(entity, GLTFLoadedComponent)
    const components = getAllComponents(entity)
    if (hasComponent(entity, NameComponent)) {
      nodeDef.name = getComponent(entity, NameComponent)
    }
    for (const component of components) {
      if (
        component === TransformComponent ||
        component === LocalTransformComponent || //skip transform data as that is stored in the object3d
        !component.jsonID //skip components that don't have a jsonID
      )
        continue
      const compData = component.toJSON(entity, getMutableComponent(entity, component))
      if (!compData) continue
      const extensionName = `EE_${component.jsonID}`
      nodeDef.extensions = nodeDef.extensions ?? {}
      nodeDef.extensions[extensionName] = compData
      this.writer.extensionsUsed[extensionName] = true
    }
    this.writer.extensionsUsed[this.name] = true
  }
}
