import { Box3, BufferAttribute } from 'three'
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

  generate(geometry, options = {}) {
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
          geometry.attributes.position.array = position
          geometry.setIndex(new BufferAttribute(serialized.index, 1, false))

          if (boundsOptions.setBoundingBox) {
            geometry.boundingBox = bvh.getBoundingBox(new Box3())
          }

          resolve(bvh)
        }
      }

      const index = geometry.index ? geometry.index.array : null
      const position = geometry.attributes.position.array

      if (position.isInterleavedBufferAttribute || (index && index.isInterleavedBufferAttribute)) {
        throw new Error(
          'GenerateMeshBVHWorker: InterleavedBufferAttribute are not supported for the geometry attributes.'
        )
      }

      const transferrables = [position]
      if (index) {
        transferrables.push(index)
      }

      worker.postMessage(
        {
          index,
          position,
          options
        },
        transferrables.map((arr) => arr.buffer)
      )
    })
  }

  terminate() {
    this.worker.terminate()
  }
}
