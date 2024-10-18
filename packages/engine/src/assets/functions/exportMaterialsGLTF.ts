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

import { BufferGeometry, Material, Mesh, Scene } from 'three'

import { Entity, getComponent } from '@ir-engine/ecs'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'

import { GLTFExporterOptions } from '../exporters/gltf/GLTFExporter'
import createGLTFExporter from './createGLTFExporter'

/**@todo stop using three's exporter when we start serializing ecs material data */
export default async function exportMaterialsGLTF(
  materialEntities: Entity[],
  options: GLTFExporterOptions
): Promise<ArrayBuffer | { [key: string]: any } | undefined> {
  if (materialEntities.length === 0) return
  const scene = new Scene()
  scene.name = 'Root'
  const dudGeo = new BufferGeometry()
  dudGeo.groups = materialEntities.map((_, i) => ({ count: 0, start: 0, materialIndex: i }))
  const materials = materialEntities.map((entity) => getComponent(entity, MaterialStateComponent).material as Material)
  const lib = new Mesh(dudGeo, materials)
  lib.name = 'Materials'
  scene.add(lib)
  const exporter = createGLTFExporter()
  const gltf = await new Promise<ArrayBuffer | { [key: string]: any }>((resolve) => {
    exporter.parse(
      scene,
      resolve,
      (e) => {
        throw e
      },
      {
        ...options,
        embedImages: options.binary,
        includeCustomExtensions: true
      }
    )
  })

  return gltf
}
