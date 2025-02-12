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

import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  InstancedMesh,
  InterleavedBufferAttribute,
  Mesh,
  TypedArray
} from 'three'
import { MeshBVH, MeshBVHOptions, SerializedBVH } from 'three-mesh-bvh'

export async function generateMeshBVH(mesh: Mesh, signal: AbortSignal, options = {} as any) {
  if (
    !mesh.isMesh ||
    (mesh as InstancedMesh).isInstancedMesh ||
    !mesh.geometry ||
    !mesh.geometry.attributes.position ||
    mesh.geometry.boundsTree
  )
    return Promise.resolve()

  const geometry = mesh.geometry as BufferGeometry

  const index = geometry.index ? Uint32Array.from(geometry.index.array) : null
  const pos = Float32Array.from((geometry.attributes.position as BufferAttribute | InterleavedBufferAttribute).array)

  const transferrables = [pos as ArrayLike<number>]
  if (index) {
    transferrables.push(index as ArrayLike<number>)
  }

  const { serialized, error } = processMessage({
    index,
    position: pos,
    options
  })

  if (error) {
    return console.error(error)
  } else {
    // MeshBVH uses generated index instead of default geometry index

    //geometry.setIndex(new BufferAttribute(serialized.index as any, 1))

    const bvh = MeshBVH.deserialize(serialized as SerializedBVH, geometry, { setIndex: false })
    const boundsOptions = Object.assign(
      {
        setBoundingBox: true
      },
      options
    )

    if (boundsOptions.setBoundingBox) {
      geometry.boundingBox = bvh.getBoundingBox(new Box3())
    }

    geometry.boundsTree = bvh

    return bvh
  }
}

type BVHWorkerResponse = {
  serialized: SerializedBVH
  error?: string
}

const processMessage = (data: { index: TypedArray | null; position: TypedArray; options: MeshBVHOptions }) => {
  const { index, position, options } = data

  try {
    const geometry = new BufferGeometry()
    geometry.setAttribute('position', new BufferAttribute(position, 3))
    if (index) {
      geometry.setIndex(new BufferAttribute(index, 1))
    }
    // options.lazyGeneration = false
    const bvh = new MeshBVH(geometry, options)
    const serialized = MeshBVH.serialize(bvh, {})

    return { serialized, error: null }
  } catch (error) {
    return { serialized: null, error }
  }
}
