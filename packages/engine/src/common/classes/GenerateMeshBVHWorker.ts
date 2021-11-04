import { Box3, BufferAttribute, BufferGeometry, InterleavedBufferAttribute } from 'three'
// @ts-ignore
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
          // MeshBVH uses generated index instead of default geometry index
          geometry.setIndex(new BufferAttribute(serialized.index, 1))

          const bvh = MeshBVH.deserialize(serialized, geometry)
          const boundsOptions = Object.assign(
            {
              setBoundingBox: true
            },
            options
          )

          if (boundsOptions.setBoundingBox) {
            geometry.boundingBox = bvh.getBoundingBox(new Box3())
          }

          resolve(bvh)
        }
      }

      if (!geometry.attributes.position) {
        console.warn('Position attribute is not defined')
        return
      }

      if (
        (geometry.attributes.position as InterleavedBufferAttribute).isInterleavedBufferAttribute ||
        (geometry.index && (geometry.index as any as InterleavedBufferAttribute).isInterleavedBufferAttribute)
      ) {
        throw new Error(
          'GenerateMeshBVHWorker: InterleavedBufferAttribute are not supported for the geometry attributes.'
        )
      }

      const index = geometry.index ? Uint32Array.from(geometry.index.array) : null
      const position = Float32Array.from(geometry.attributes.position.array)

      const transferrables = [position as ArrayLike<number>]
      if (index) {
        transferrables.push(index as ArrayLike<number>)
      }

      worker.postMessage(
        {
          index,
          position,
          options
        },
        transferrables.map((arr: any) => arr.buffer)
      )
    })
  }

  terminate() {
    this.worker.terminate()
  }
}
