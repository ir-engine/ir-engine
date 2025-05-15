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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

// TODO: Current version of web-worker does not support importScripts on server side
// Related PR: https://github.com/developit/web-worker/pull/9

importScripts('/workers/three.umd.min.js')
importScripts('/workers/index.umd.cjs.js')

onmessage = function ({ data }) {
  const { index, position, groups, options } = data

  try {
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3, false))
    if (index) {
      geometry.index = new THREE.BufferAttribute(index, 1, false)
    }
    if (groups) {
      for (const group of groups) {
        geometry.addGroup(group.start, group.count, group.materialIndex)
      }
    }
    options.lazyGeneration = false
    const bvh = new MeshBVHLib.MeshBVH(geometry, { setBoundingBox: false, ...options })
    const serialized = MeshBVHLib.MeshBVH.serialize(bvh, { cloneBuffers: false })

    let transferrables = [position.buffer, ...serialized.roots]
    if (serialized.index) {
      transferrables.push(serialized.index.buffer)
    }
    if (bvh._indirectBuffer) {
      transferrables.push(serialized.indirectBuffer.buffer)
    }

    postMessage(
      {
        error: null,
        serialized,
        groups: geometry.groups
      },
      transferrables
    )
  } catch (error) {
    postMessage({
      error,
      serialized: null
    })
  }
}
