/**
 * GPU Instancing Extension
 *
 * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
 *
 */

import type { GLTFParser } from '../loaders/gltf/GLTFLoader'
import { InstancedMesh, Object3D } from 'three'

export class GLTFInstancingExtension {
  name = 'EXT_mesh_gpu_instancing'
  parser: GLTFParser
  constructor(parser) {
    this.parser = parser
  }

  createNodeMesh(nodeIndex) {
    const json = this.parser.json
    const nodeDef = json.nodes[nodeIndex]

    if (!nodeDef.extensions || !nodeDef.extensions[this.name] || nodeDef.mesh === undefined) {
      return null
    }

    const extensionDef = nodeDef.extensions[this.name]
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
