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

import { Loader } from './Loader'

class ResourceLoadingManager {
  onItemStart?: (url: string) => void
  onStart?: (url: string, loaded: number, total: number) => void
  onLoad?: () => void
  onProgress?: (url: string, loaded: number, total: number) => void
  onError?: (url: string) => void

  isLoading = false
  itemsLoaded = 0
  itemsTotal = 0
  urlModifier?: (url: string) => string
  handlers = [] as (RegExp | Loader)[]

  constructor(
    onItemStart?: (url: string) => void,
    onStart?: (url: string, loaded: number, total: number) => void,
    onLoad?: () => void,
    onProgress?: (url: string, loaded: number, total: number) => void,
    onError?: (url: string) => void
  ) {
    this.onItemStart = onItemStart
    this.onStart = onStart
    this.onLoad = onLoad
    this.onProgress = onProgress
    this.onError = onError
  }

  itemStart = (url: string) => {
    this.itemsTotal++

    if (this.isLoading === false) {
      if (this.onStart !== undefined) {
        this.onStart(url, this.itemsLoaded, this.itemsTotal)
      }
    }

    if (this.onItemStart !== undefined) this.onItemStart(url)

    this.isLoading = true
  }

  itemEnd = (url: string) => {
    this.itemsLoaded++

    if (this.onProgress !== undefined) {
      this.onProgress(url, this.itemsLoaded, this.itemsTotal)
    }

    if (this.itemsLoaded === this.itemsTotal) {
      this.isLoading = false

      if (this.onLoad !== undefined) {
        this.onLoad()
      }
    }
  }

  itemError = (url: string) => {
    if (this.onError !== undefined) {
      this.onError(url)
    }
  }

  resolveURL = (url: string): string => {
    if (this.urlModifier) {
      return this.urlModifier(url)
    }

    return url
  }

  setURLModifier = (callback?: (url: string) => string): this => {
    this.urlModifier = callback

    return this
  }

  addHandler = (regex: RegExp, loader: Loader): this => {
    this.handlers.push(regex, loader)

    return this
  }

  removeHandler = (regex: RegExp): this => {
    const index = this.handlers.indexOf(regex)

    if (index !== -1) {
      this.handlers.splice(index, 2)
    }

    return this
  }

  getHandler = (file: string): Loader | null => {
    for (let i = 0, l = this.handlers.length; i < l; i += 2) {
      const regex = this.handlers[i] as RegExp
      const loader = this.handlers[i + 1] as Loader

      if (regex.global) regex.lastIndex = 0

      if (regex.test(file)) {
        return loader
      }
    }

    return null
  }
}

export { ResourceLoadingManager }
