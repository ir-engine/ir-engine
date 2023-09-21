
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


import { BufferAttribute, BufferGeometry, FileLoader } from 'three'

class CORTOLoader {
  constructor() {
    this.decoderPath = ''
    this.decoderPending = null

    this.worker = null
    this.lastRequest = 0
    this.callbacks = {}

    this.defaultAttributes = [
      { name: 'position', numComponents: '3' },
      { name: 'normal', numComponents: '3' },
      { name: 'color', numComponents: '4' },
      { name: 'uv', numComponents: '2' }
    ]
  }

  setDecoderPath(path) {
    this.decoderPath = path
    return this
  }

  load(url, byteStart, byteEnd, onLoad) {
    if (!this.decoderPending) {
      this.preload()
    }

    this.decoderPending.then(() => {
      const request = this.lastRequest++
      this.worker.postMessage({
        request: request,
        url: url,
        byteStart: byteStart,
        byteEnd: byteEnd
      })
      this.callbacks[request] = { onLoad: onLoad }
    })
  }

  preload() {
    if (this.decoderPending) return this.decoderPending

    let that = this
    let callbacks = this.callbacks
    let lib = 'corto.js'

    this.decoderPending = this._loadLibrary(lib, 'text').then((text) => {
      text = URL.createObjectURL(new Blob([text]))
      this.worker = new Worker(text)

      this.worker.onmessage = function (e) {
        var message = e.data
        if (!callbacks[message.request]) return

        let callback = callbacks[message.request]
        let geometry = that._createGeometry(message.geometry)
        callback.onLoad(geometry)
        delete callbacks[message.request]
      }
    })

    return this.decoderPending
  }

  dispose() {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    return this
  }

  _createGeometry(geometry) {
    var bufferGeometry = new BufferGeometry()

    if (geometry.index) bufferGeometry.setIndex(new BufferAttribute(geometry.index, 1))

    for (let i = 0; i < this.defaultAttributes.length; i++) {
      let attr = this.defaultAttributes[i]
      if (!geometry[attr.name]) continue
      let buffer = geometry[attr.name]
      bufferGeometry.setAttribute(attr.name, new BufferAttribute(buffer, attr.numComponents))
    }
    return bufferGeometry
  }

  _loadLibrary(url, responseType) {
    var loader = new FileLoader(this.manager)
    loader.setPath(this.decoderPath)
    loader.setResponseType(responseType)

    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject)
    })
  }
}

export { CORTOLoader }
