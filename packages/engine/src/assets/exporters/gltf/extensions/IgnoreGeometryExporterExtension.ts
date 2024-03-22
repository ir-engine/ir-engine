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

import { Entity, getOptionalComponent, removeComponent } from '@etherealengine/ecs'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { iterateEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { Mesh, Object3D } from 'three'
import { PrimitiveGeometryComponent } from '../../../../scene/components/PrimitiveGeometryComponent'
import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

export default class IgnoreGeometryExporterExtension extends ExporterExtension implements GLTFExporterPlugin {
  entitySet: { entity: Entity; parent: Entity }[]
  meshSet: { mesh: Mesh; parent: Entity }[]
  constructor(writer: GLTFWriter) {
    super(writer)
    this.name = 'EE_ignoreGeometry'
    this.entitySet = [] as { entity: Entity; parent: Entity }[]
    this.meshSet = [] as { mesh: Mesh; parent: Entity }[]
  }
  beforeParse(input: Object3D | Object3D[]) {
    const root = (Array.isArray(input) ? input[0] : input) as Object3D
    iterateEntityNode(root.entity, (entity) => {
      const primitiveGeo = getOptionalComponent(entity, PrimitiveGeometryComponent)
      if (primitiveGeo == undefined) return
      removeComponent(entity, MeshComponent)
    })
  }
}
