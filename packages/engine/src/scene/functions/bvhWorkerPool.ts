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

import { InstancedMesh, Mesh } from 'three'

import { GenerateMeshBVHWorker } from '../../common/classes/GenerateMeshBVHWorker'

const poolSize = 1

const bvhWorkers: GenerateMeshBVHWorker[] = []
const meshQueue: Mesh[] = []

export function generateMeshBVH(mesh: Mesh | InstancedMesh) {
  if (
    !mesh.isMesh ||
    (mesh as InstancedMesh).isInstancedMesh ||
    !mesh.geometry ||
    !mesh.geometry.attributes.position ||
    (mesh.geometry as any).boundsTree
  )
    return Promise.resolve()
  if (!bvhWorkers.length) {
    for (let i = 0; i < poolSize; i++) {
      bvhWorkers.push(new GenerateMeshBVHWorker())
    }
  }

  meshQueue.push(mesh)
  runBVHGenerator()

  return new Promise<void>((resolve) => {
    ;(mesh as any).resolvePromiseBVH = resolve
  })
}

function runBVHGenerator() {
  for (const worker of bvhWorkers) {
    if (meshQueue.length < 1) {
      break
    }

    if (worker.running) {
      continue
    }

    const mesh = meshQueue.shift() as Mesh

    worker.generate(mesh.geometry).then((bvh) => {
      ;(mesh.geometry as any).boundsTree = bvh
      runBVHGenerator()
      ;(mesh as any).resolvePromiseBVH && (mesh as any).resolvePromiseBVH()
    })
  }
}
