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

import { sha3_256 } from 'js-sha3'
import { Event, LoaderUtils, Mesh, Object3D } from 'three'
import { generateUUID } from 'three/src/math/MathUtils'
import matches, { Validator } from 'ts-matches'

import { defineAction, dispatchAction } from '@etherealengine/hyperflux'

import iterateObject3D from '../../../../scene/util/iterateObject3D'
import { AssetLoader } from '../../../classes/AssetLoader'
import { getProjectName, getRelativeURI, modelResourcesPath } from '../../../functions/pathResolver'
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

  comparisonCanvas: HTMLCanvasElement
  bufferCache: Record<string, string>

  constructor(writer: GLTFWriter) {
    super(writer)
    this.bufferCache = {}
    this.comparisonCanvas = document.createElement('canvas')
  }

  beforeParse(input: Object3D<Event> | Object3D<Event>[]) {
    const writer = this.writer
    if (writer.options.embedImages) return
    this.projectName = getProjectName(writer.options.path!)
    this.modelName = getRelativeURI(writer.options.path!)
    this.resourceURI = writer.options.resourceURI ?? null
    const inputs = Array.isArray(input) ? input : [input]
    inputs.forEach((input) =>
      iterateObject3D(input, (child: Mesh) => {
        if (child?.isMesh) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((material) => {
            console.log(material)
          })
        }
      })
    )
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
      uri = `${this.resourceURI ?? modelResourcesPath(modelName)}/images/${name}.png`
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
      uri = `${this.resourceURI ?? modelResourcesPath(modelName)}/images/${name}.png`
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
    const modelName = this.modelName

    const json = writer.json
    const buffers = writer.buffers
    const options = writer.options

    if (!options?.binary) {
      writer.buffers.map((buffer, index) => {
        const hash = sha3_256.create()
        const view = new DataView(buffer)
        for (let i = 0; i < buffer.byteLength; i++) {
          hash.update(String.fromCharCode(view.getUint8(i)))
        }
        const name = hash.hex()
        const uri = `${this.resourceURI ?? modelResourcesPath(modelName)}/buffers/${name}.bin`
        const projectSpaceModelName = this.resourceURI
          ? LoaderUtils.resolveURL(uri, LoaderUtils.extractUrlBase(modelName))
          : modelName
        const bufferDef: BufferJson = {
          name,
          byteLength: buffer.byteLength,
          uri
        }
        json.buffers[index] = bufferDef

        const saveParms = {
          ...bufferDef,
          uri: this.resourceURI ? projectSpaceModelName.replace(/^assets\//, '') : uri,
          buffer: buffers[index]
        }
        if (!this.bufferCache[name]) {
          dispatchAction(
            BufferHandlerExtension.saveBuffer({
              projectName,
              modelName: projectSpaceModelName,
              saveParms
            })
          )
          this.bufferCache[name] = uri
        } else {
          bufferDef.uri = this.bufferCache[name]
        }
      })
    }
  }
}
