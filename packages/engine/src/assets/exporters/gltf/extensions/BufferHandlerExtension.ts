import { Object3D } from 'three'
import { generateUUID } from 'three/src/math/MathUtils'
import matches, { Validator } from 'ts-matches'

import { defineAction, dispatchAction } from '@xrengine/hyperflux'

import { GLTFWriter } from '../GLTFExporter'
import { ExporterExtension } from './ExporterExtension'

type BufferJson = {
  name: string
  byteLength: number
  uri: string
  extensions?: { [extName: string]: any }
}

type BufferDefinition = BufferJson & {
  buffer: ArrayBuffer
}

export default class BufferHandlerExtension extends ExporterExtension {
  static saveBuffer = defineAction({
    type: 'xre.assets.BufferHandlerExtension.SAVE_BUFFER' as const,
    saveParms: matches.object as Validator<unknown, BufferDefinition>
  })

  afterParse(input: Object3D | Object3D[]) {
    const writer = this.writer
    const json = writer.json
    const buffers = writer.buffers
    const options = writer.options
    if (!options?.binary) {
      writer.buffers.map((buffer, index) => {
        const name = generateUUID()
        const bufferDef: BufferJson = {
          name,
          byteLength: buffer.byteLength,
          uri: `model-resources/${name}.bin`
        }
        json.buffers[index] = bufferDef
        dispatchAction(
          BufferHandlerExtension.saveBuffer({
            saveParms: {
              ...bufferDef,
              buffer: buffers[index]
            }
          })
        )
      })
    }
  }
}
