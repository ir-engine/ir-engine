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

class LoadingManager {
  onStart: (...args: any[]) => void
  onLoad: (...args: any[]) => void
  onProgress: (...args: any[]) => void
  onError: (...args: any[]) => void
  itemStart: (url: string) => void
  itemEnd: (url: string) => void
  itemError: (url: string) => void
  resolveURL: (url: string) => string
  setURLModifier: (transform) => LoadingManager
  addHandler: (regex: RegExp, loader) => LoadingManager
  removeHandler: (regex: RegExp) => LoadingManager
  getHandler: (file: string) => any
  constructor(onLoad, onProgress, onError) {
    let isLoading = false
    let itemsLoaded = 0
    let itemsTotal = 0
    let urlModifier: any = undefined
    const handlers: Array<RegExp> = []

    this.onLoad = onLoad
    this.onProgress = onProgress
    this.onError = onError

    this.itemStart = function (url) {
      itemsTotal++

      if (isLoading === false) {
        if (this.onStart !== undefined) {
          this.onStart(url, itemsLoaded, itemsTotal)
        }
      }

      isLoading = true
    }

    this.itemEnd = function (url) {
      itemsLoaded++

      if (this.onProgress !== undefined) {
        this.onProgress(url, itemsLoaded, itemsTotal)
      }

      if (itemsLoaded === itemsTotal) {
        isLoading = false

        if (this.onLoad !== undefined) {
          this.onLoad()
        }
      }
    }

    this.itemError = function (url) {
      if (this.onError !== undefined) {
        this.onError(url)
      }
    }

    this.resolveURL = function (url) {
      if (urlModifier) {
        return urlModifier(url)
      }

      return url
    }

    this.setURLModifier = function (transform) {
      urlModifier = transform

      return this
    }

    this.addHandler = function (regex, loader) {
      handlers.push(regex, loader)

      return this
    }

    this.removeHandler = function (regex) {
      const index = handlers.indexOf(regex)

      if (index !== -1) {
        handlers.splice(index, 2)
      }

      return this
    }

    this.getHandler = function (file) {
      for (let i = 0, l = handlers.length; i < l; i += 2) {
        const regex = handlers[i]
        const loader = handlers[i + 1]

        if (regex.global) regex.lastIndex = 0 // see #17920

        if (regex.test(file)) {
          return loader
        }
      }

      return null
    }
  }
}

const DefaultLoadingManager = new LoadingManager(undefined, undefined, undefined)

export { DefaultLoadingManager, LoadingManager }
