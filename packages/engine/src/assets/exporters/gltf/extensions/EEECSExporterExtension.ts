/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Object3D } from 'three'

import { getAllComponents, getComponent, hasComponent, serializeComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'
import { TransformComponent } from '@ir-engine/spatial/src/transform/components/TransformComponent'

import { SourceComponent } from '../../../../scene/components/SourceComponent'
import { GLTFExporterPlugin } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export class EEECSExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  name = 'EE_ecs'

  writeNode(object: Object3D, nodeDef: { [key: string]: any }) {
    if (!object.entity) return
    const entity = object.entity
    if (!hasComponent(entity, SourceComponent)) return
    //const gltfLoaded = getComponent(entity, GLTFLoadedComponent)
    const components = getAllComponents(entity)
    if (hasComponent(entity, NameComponent)) {
      nodeDef.name = getComponent(entity, NameComponent)
    }
    for (const component of components) {
      if (
        component === TransformComponent ||
        component === TransformComponent || //skip transform data as that is stored in the object3d
        !component.jsonID //skip components that don't have a jsonID
      )
        continue
      const compData = serializeComponent(entity, component)
      if (!compData) continue
      const extensionName = component.jsonID
      nodeDef.extensions = nodeDef.extensions ?? {}
      nodeDef.extensions[extensionName] = compData
      this.writer.extensionsUsed[extensionName] = true
    }
    this.writer.extensionsUsed[this.name] = true
  }
}
