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

/**
 * GPU Instancing Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
 *
 */
import { InstancedMesh, Object3D } from 'three'

import { GLTFParser } from '../GLTFParser'

export class GPUInstancingExtension {
  name = 'EXT_mesh_gpu_instancing'
  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }

  createNodeMesh(nodeIndex) {
    const json = this.parser.json
    const nodeDef = json.nodes![nodeIndex]

    if (!nodeDef.extensions || !nodeDef.extensions[this.name] || nodeDef.mesh === undefined) {
      return null
    }

    const extensionDef = nodeDef.extensions[this.name] as any
    const attributesDef = extensionDef.attributes

    // @TODO: Should we directly create InstancedMesh, not from regular Mesh?
    // @TODO: Can we support InstancedMesh + SkinnedMesh?
    const pending = [] as any
    const attributes = {} as any
    pending.push(this.parser.createNodeMesh(nodeIndex))
    for (const key in attributesDef) {
      pending.push(
        this.parser.getDependency('accessor', attributesDef[key]).then((accessor) => {
          attributes[key] = accessor
          return attributes[key]
        })
      )
    }

    return Promise.all(pending).then((results) => {
      const mesh = results[0] as any

      // @TODO: Fix me. Support Group (= glTF multiple mesh.primitives).
      if (!mesh.isMesh) {
        return mesh
      }

      const result_1 = results[1] as any
      const count = result_1.count // All attribute counts should be same

      // For Working
      const m = mesh.matrix.clone()
      const p = mesh.position.clone().set(0, 0, 0)
      const q = mesh.quaternion.clone().set(0, 0, 0, 1)
      const s = mesh.scale.clone().set(1, 1, 1)

      const instancedMesh = new InstancedMesh(mesh.geometry, mesh.material, count)
      for (let i = 0; i < count; i++) {
        if (attributes.TRANSLATION) {
          p.fromBufferAttribute(attributes.TRANSLATION, i)
        }
        if (attributes.ROTATION) {
          q.fromBufferAttribute(attributes.ROTATION, i)
        }
        if (attributes.SCALE) {
          s.fromBufferAttribute(attributes.SCALE, i)
        }
        // @TODO: Support _ID and others
        instancedMesh.setMatrixAt(i, m.compose(p, q, s))
      }

      // Just in case
      Object3D.prototype.copy.call(instancedMesh, mesh)

      instancedMesh.frustumCulled = false
      this.parser.assignFinalMaterial(instancedMesh)
      return instancedMesh
    })
  }

  loadImage() {
    return null
  }
  loadMaterial() {
    return null
  }
  loadTexture() {
    return null
  }
}
