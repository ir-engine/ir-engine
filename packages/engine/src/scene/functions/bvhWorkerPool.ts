import { Mesh } from 'three'
import { GenerateMeshBVHWorker } from '../../common/classes/GenerateMeshBVHWorker'

//TODO: Find number of cores on server side
let poolSize = 2

// if (isClient) {
//   poolSize = window.navigator?.hardwareConcurrency || 2
// }

const bvhWorkers: GenerateMeshBVHWorker[] = []
const meshQueue: Mesh[] = []

export function generateMeshBVH(mesh) {
  if (!mesh.isMesh) return
  if (!bvhWorkers.length) {
    for (let i = 0; i < poolSize; i++) {
      bvhWorkers.push(new GenerateMeshBVHWorker())
    }
  }

  meshQueue.push(mesh)

  runBVHGenerator()
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
    })
  }
}
