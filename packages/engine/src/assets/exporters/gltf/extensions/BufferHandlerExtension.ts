import { Event, LoaderUtils, Object3D } from 'three'
import { generateUUID } from 'three/src/math/MathUtils'
import matches, { Validator } from 'ts-matches'

import { defineAction, dispatchAction } from '@etherealengine/hyperflux'

import { AssetLoader } from '../../../classes/AssetLoader'
import { getFileName, getProjectName, getRelativeURI, modelResourcesPath } from '../../../functions/pathResolver'
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
  static beginModelExport = defineAction({
    type: 'xre.assets.BufferHandlerExtension.BEGIN_MODEL_EXPORT' as const,
    projectName: matches.string,
    modelName: matches.string
  })
  static saveBuffer = defineAction({
    type: 'xre.assets.BufferHandlerExtension.SAVE_BUFFER' as const,
    projectName: matches.string,
    modelName: matches.string,
    saveParms: matches.object as Validator<unknown, BufferDefinition>
  })

  projectName: string
  modelName: string
  resourceURI: string | null

  beforeParse(input: Object3D<Event> | Object3D<Event>[]) {
    const writer = this.writer
    if (writer.options.embedImages) return
    this.projectName = getProjectName(writer.options.path!)
    this.modelName = getRelativeURI(writer.options.path!)
    this.resourceURI = writer.options.resourceURI ?? null
    dispatchAction(
      BufferHandlerExtension.beginModelExport({
        projectName: this.projectName,
        modelName: this.modelName
      })
    )
  }

  writeImage(image: HTMLImageElement | HTMLCanvasElement, imageDef: { [key: string]: any }) {
    //only execute when images are not embedded
    if (this.writer.options.embedImages) return
    const name = generateUUID()
    const projectName = this.projectName
    const modelName = this.modelName
    let buffer: ArrayBuffer
    let uri: string
    let bufferPromise: Promise<void>
    if (image instanceof HTMLCanvasElement) {
      if (typeof image.toBlob !== 'function') {
        console.error('trying to serialize unprocessed canvas')
      }
      uri = `${this.resourceURI ? modelName : modelResourcesPath(modelName)}/images/${name}.png`
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
      uri = `${modelResourcesPath(modelName)}/images/${name}.png`
      bufferPromise = new Promise<void>((resolve) => {
        fetch(image.src)
          .then((response) => response.blob())
          .then((blob) => blob.arrayBuffer())
          .then((arrayBuf) => {
            buffer = arrayBuf
            resolve()
          })
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
        imageDef.mimeType = `image/${AssetLoader.getAssetType(uri)}`
        dispatchAction(BufferHandlerExtension.saveBuffer({ saveParms, projectName, modelName }))
      })
    )
  }

  afterParse(input: Object3D | Object3D[]) {
    const writer = this.writer
    const projectName = this.projectName
    let modelName = this.modelName
    if (this.resourceURI) {
      modelName = `${this.resourceURI}/${modelName.split('/').at(-1)!}`
    }

    const json = writer.json
    const buffers = writer.buffers
    const options = writer.options

    if (!options?.binary) {
      writer.buffers.map((buffer, index) => {
        const name = generateUUID()
        const uri = `${this.resourceURI ? modelResourcesPath(modelName) : modelName}/buffers/${name}.bin`
        const bufferDef: BufferJson = {
          name,
          byteLength: buffer.byteLength,
          uri
        }
        json.buffers[index] = bufferDef
        dispatchAction(
          BufferHandlerExtension.saveBuffer({
            projectName,
            modelName,
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
