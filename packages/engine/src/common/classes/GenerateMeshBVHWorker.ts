import { Box3, BufferGeometry, InterleavedBufferAttribute } from 'three'
import { MeshBVH } from 'three-mesh-bvh'
import { isClient } from '../functions/isClient'
import Worker from 'web-worker'

export class GenerateMeshBVHWorker {
  running: boolean
  worker: Worker

  constructor() {
    this.running = false

    if (isClient) {
      // module workers currently don't work in safari and firefox
      this.worker = new Worker('/workers/generateBVHAsync.worker.js')
    } else {
      this._serverWorker()
    }
  }

  async _serverWorker() {
    const path = await require('path')
    const workerPath = path.resolve(__dirname, './generateBVHAsync.worker.js')
    this.worker = new Worker(workerPath, { type: 'module' })
  }

  generate(geometry: BufferGeometry, options = {}) {
    if (this.running) {
      throw new Error('GenerateMeshBVHWorker: Already running job.')
    }

    const { worker } = this
    this.running = true

    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        this.running = false
        worker.onmessage = null
        const { serialized, position, error } = e.data

        if (error) {
          reject(new Error(error))
        } else {
          const bvh = MeshBVH.deserialize(serialized, geometry, false)
          const boundsOptions = Object.assign(
            {
              setBoundingBox: true
            },
            options
          )

          // we need to replace the arrays because they're neutered entirely by the
          // webworker transfer.
          // geometry.getAttribute('position').attributes.position.array = position
          // geometry.setIndex(new BufferAttribute(serialized.index, 1, false))

          if (boundsOptions.setBoundingBox) {
            geometry.boundingBox = bvh.getBoundingBox(new Box3())
          }

          resolve(bvh)
        }
      }

      const posAttribute = geometry.getAttribute('position')
      const position = Float32Array.from(posAttribute.array)
      if (!geometry.getIndex()) {
        geometry.setIndex(Array.from(Object.keys(posAttribute.array).map(Number)))
      }
      const index = Float32Array.from(geometry.getIndex().array)

      if (
        (posAttribute as InterleavedBufferAttribute).isInterleavedBufferAttribute ||
        (geometry.getIndex() as any as InterleavedBufferAttribute)?.isInterleavedBufferAttribute
      ) {
        console.warn(
          'GenerateMeshBVHWorker: InterleavedBufferAttribute are not supported for the geometry attributes.',
          geometry
        )
        return
      }

      const transferrables = [position.buffer, index.buffer]

      worker.postMessage(
        {
          index,
          position,
          options
        },
        transferrables
      )
    })
  }

  terminate() {
    this.worker.terminate()
  }
}
