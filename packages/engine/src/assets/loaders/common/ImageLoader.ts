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

import { Cache } from './Cache'
import { Loader } from './Loader'

function createElementNS(name) {
  return document.createElementNS('http://www.w3.org/1999/xhtml', name)
}

class ImageLoader extends Loader {
  constructor(manager) {
    super(manager)
  }

  load(url, onLoad, onProgress, onError) {
    if (this.path !== undefined) url = this.path + url

    url = this.manager.resolveURL(url)

    const cached = Cache.get(url)

    if (cached !== undefined) {
      this.manager.itemStart(url)

      setTimeout(function () {
        if (onLoad) onLoad(cached)

        this.manager.itemEnd(url)
      }, 0)

      return cached
    }

    const image = createElementNS('img')

    function onImageLoad() {
      removeEventListeners()

      Cache.add(url, this)

      if (onLoad) onLoad(this)

      this.manager.itemEnd(url)
    }

    function onImageError(event) {
      removeEventListeners()

      if (onError) onError(event)

      this.manager.itemError(url)
      this.manager.itemEnd(url)
    }

    function removeEventListeners() {
      image.removeEventListener('load', onImageLoad, false)
      image.removeEventListener('error', onImageError, false)
    }

    image.addEventListener('load', onImageLoad, false)
    image.addEventListener('error', onImageError, false)

    if (url.slice(0, 5) !== 'data:') {
      // @ts-ignore
      if (this.crossOrigin !== undefined) image.crossOrigin = this.crossOrigin
    }

    this.manager.itemStart(url)

    // @ts-ignore
    image.src = url

    return image
  }
}

export { ImageLoader }
