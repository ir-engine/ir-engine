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

import { DefaultLoadingManager, LoadingManager } from './LoadingManager'

abstract class Loader {
  manager: LoadingManager
  crossOrigin: string
  withCredentials: boolean
  path: string
  resourcePath: string
  requestHeader: HeadersInit
  static DEFAULT_MATERIAL_NAME: string

  constructor(manager: LoadingManager | undefined) {
    this.manager = manager !== undefined ? manager : DefaultLoadingManager

    this.crossOrigin = 'anonymous'
    this.withCredentials = false
    this.path = ''
    this.resourcePath = ''
    this.requestHeader = {}
  }

  abstract load(
    url: string,
    onLoad: (...args: any[]) => void,
    onProgress: (...args: any[]) => void,
    onError: (...args: any[]) => void,
    signal: AbortSignal | undefined
  ): void

  loadAsync(url, onProgress, signal: AbortSignal | undefined) {
    return new Promise((resolve, reject) => {
      this.load(url, resolve, onProgress, reject, signal)
    })
  }

  parse(/* data */) {}

  setCrossOrigin(crossOrigin) {
    this.crossOrigin = crossOrigin
    return this
  }

  setWithCredentials(value) {
    this.withCredentials = value
    return this
  }

  setPath(path) {
    this.path = path
    return this
  }

  setResourcePath(resourcePath) {
    this.resourcePath = resourcePath
    return this
  }

  setRequestHeader(requestHeader) {
    this.requestHeader = requestHeader
    return this
  }
}

Loader.DEFAULT_MATERIAL_NAME = '__DEFAULT'

export { Loader }
