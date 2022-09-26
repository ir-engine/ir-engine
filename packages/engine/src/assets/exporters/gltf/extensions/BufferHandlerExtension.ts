import { LoaderUtils, Object3D } from 'three'
import { generateUUID } from 'three/src/math/MathUtils'
import matches, { Validator } from 'ts-matches'

import { defineAction, dispatchAction } from '@xrengine/hyperflux'

import { GLTFExporterPlugin, GLTFWriter } from '../GLTFExporter'
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

export default class BufferHandlerExtension extends ExporterExtension implements GLTFExporterPlugin {
  static saveBuffer = defineAction({
    type: 'xre.assets.BufferHandlerExtension.SAVE_BUFFER' as const,
    saveParms: matches.object as Validator<unknown, BufferDefinition>
  })

  modelName: string

  constructor(writer) {
    super(writer)
    this.modelName = writer.options.path!.split(/[\\\/]+/).at(-1)!
  }

  writeImage(image: HTMLImageElement | HTMLCanvasElement, imageDef: { [key: string]: any }) {
    //only execute when images are not embedded
    if (this.writer.options.embedImages) return
    const name = generateUUID()
    const modelName = this.modelName
    let buffer: ArrayBuffer
    let uri: string
    let bufferPromise: Promise<void>
    if (image instanceof HTMLCanvasElement) {
      if (typeof image.toBlob !== 'function') {
        console.error('trying to serialize unprocessed canvas')
      }
      uri = `model-resources/${modelName}/images/${name}.png`
      bufferPromise = new Promise<void>(async (resolve) => {
        buffer = await new Promise<ArrayBuffer>((resolve) => {
          image.toBlob((blob) => blob!.arrayBuffer().then(resolve))
        })
        resolve()
      })
    } else {
      if (!image.src) {
        console.error('trying to serialize unprocessed image')
      }
      if (!/^blob:/.test(image.src)) return
      uri = `model-resources/${modelName}/images/${name}.png`
      bufferPromise = new Promise<void>(async (resolve) => {
        buffer = await fetch(image.src)
          .then((response) => response.blob())
          .then((blob) => blob.arrayBuffer())
        resolve()
      })
    }
    this.writer.pending.push(
      bufferPromise.then(() => {
        const saveParms: BufferJson & { buffer: ArrayBuffer } = {
          name,
          byteLength: buffer.byteLength,
          uri,
          buffer
        }
        imageDef.uri = uri
        dispatchAction(BufferHandlerExtension.saveBuffer({ saveParms }))
      })
    )
  }

  afterParse(input: Object3D | Object3D[]) {
    const writer = this.writer
    const modelName = this.modelName
    const json = writer.json
    const buffers = writer.buffers
    const options = writer.options

    if (!options?.binary) {
      writer.buffers.map((buffer, index) => {
        const name = generateUUID()
        const bufferDef: BufferJson = {
          name,
          byteLength: buffer.byteLength,
          uri: `model-resources/${modelName}/buffers/${name}.bin`
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
