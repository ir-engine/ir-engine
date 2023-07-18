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

import { BufferAttribute, Matrix4, Quaternion, Vector3 } from 'three'

import { ExporterExtension } from './ExporterExtension'

/**
 * Mesh GPU Instancing extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/blob/main/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
 */
export default class GPUInstancingExporterExtension extends ExporterExtension {
  constructor(writer) {
    super(writer)
    this.name = 'EXT_mesh_gpu_instancing'
  }

  writeNode(node, nodeDef) {
    if (node.isInstancedMesh !== true) {
      return
    }

    const count = node.count
    const matrix = new Matrix4()
    const positions = new Float32Array(count * 3)
    const quaternions = new Float32Array(count * 4)
    const scales = new Float32Array(count * 3)

    const p = new Vector3()
    const q = new Quaternion()
    const s = new Vector3()

    for (let i = 0; i < count; i++) {
      node.getMatrixAt(i, matrix)
      matrix.decompose(p, q, s)

      positions[i * 3] = p.x
      positions[i * 3 + 1] = p.y
      positions[i * 3 + 2] = p.z

      quaternions[i * 4] = q.x
      quaternions[i * 4 + 1] = q.y
      quaternions[i * 4 + 2] = q.z
      quaternions[i * 4 + 3] = q.w

      scales[i * 3] = s.x
      scales[i * 3 + 1] = s.y
      scales[i * 3 + 2] = s.z
    }

    const writer = this.writer
    const extensionDef: any = {}

    // @TODO: Export attributes only if the values are not default values?
    // @TODO: Support colors
    extensionDef.attributes = {
      TRANSLATION: writer.processAccessor(new BufferAttribute(positions, 3)),
      ROTATION: writer.processAccessor(new BufferAttribute(quaternions, 4)),
      SCALE: writer.processAccessor(new BufferAttribute(scales, 3))
    }

    nodeDef.extensions = nodeDef.extensions || {}
    nodeDef.extensions[this.name] = extensionDef
    writer.extensionsUsed[this.name] = true
  }
}
