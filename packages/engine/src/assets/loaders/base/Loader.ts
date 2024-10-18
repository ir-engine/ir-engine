/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { DefaultLoadingManager, LoadingManager } from 'three'

interface Load<TData, TUrl> {
  load: (
    url: TUrl,
    onLoad: (data: TData) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) => void
}

class Loader<TData = unknown, TUrl = string> implements Load<TData, TUrl> {
  static DEFAULT_MATERIAL_NAME = '__DEFAULT'

  manager: LoadingManager
  crossOrigin: string
  withCredentials: boolean
  path: string
  resourcePath: string
  requestHeader: { [header: string]: string }

  constructor(manager?: LoadingManager) {
    this.manager = manager !== undefined ? manager : DefaultLoadingManager

    this.crossOrigin = 'anonymous'
    this.withCredentials = false
    this.path = ''
    this.resourcePath = ''
    this.requestHeader = {}
  }

  load(
    url: TUrl,
    onLoad: (data: TData) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
    signal?: AbortSignal
  ) {}

  loadAsync(url: TUrl, onProgress?: (event: ProgressEvent) => void): Promise<TData> {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scope = this

    return new Promise(function (resolve, reject) {
      scope.load(url, resolve, onProgress, reject)
    })
  }

  parse(data, path, onLoad, onError, url = '') {}

  setCrossOrigin(crossOrigin: string): this {
    this.crossOrigin = crossOrigin
    return this
  }

  setWithCredentials(value: boolean): this {
    this.withCredentials = value
    return this
  }

  setPath(path: string): this {
    this.path = path
    return this
  }

  setResourcePath(resourcePath: string): this {
    this.resourcePath = resourcePath
    return this
  }

  setRequestHeader(requestHeader: { [header: string]: string }): this {
    this.requestHeader = requestHeader
    return this
  }
}

export { Loader }
