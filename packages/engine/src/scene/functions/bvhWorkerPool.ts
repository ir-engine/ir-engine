import { Mesh } from 'three'

import { GenerateMeshBVHWorker } from '../../common/classes/GenerateMeshBVHWorker'

const poolSize = 1

const bvhWorkers: GenerateMeshBVHWorker[] = []
const meshQueue: Mesh[] = []

export function generateMeshBVH(mesh: Mesh) {
  if (!mesh.isMesh || !mesh.geometry || !mesh.geometry.attributes.position) return Promise.resolve()
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
