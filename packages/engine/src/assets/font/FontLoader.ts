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

import { FileLoader, Loader, LoadingManager, ShapePath } from 'three'

export class FontLoader extends Loader {
  constructor(manager?: LoadingManager) {
    super(manager)
  }

  load(url, onLoad, onProgress?, onError?) {
    const loader = new FileLoader(this.manager)
    loader.setPath(this.path)
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(this.withCredentials)
    loader.load(
      url,
      (text: string) => {
        let json

        try {
          json = JSON.parse(text)
        } catch (e) {
          console.warn('THREE.FontLoader: typeface.js support is being deprecated. Use typeface.json instead.')
          json = JSON.parse(text.substring(65, text.length - 2))
        }

        const font = this.parse(json)

        if (onLoad) onLoad(font)
      },
      onProgress,
      onError
    )
  }

  parse(json) {
    return new Font(json)
  }
}

//

export class Font {
  data: any
  readonly type = 'Font' as const
  readonly isFont = true

  constructor(data) {
    this.data = data
  }

  generateShapes(text, size = 100) {
    const shapes = []
    const paths: any[] = createPaths(text, size, this.data)

    for (let p = 0, pl = paths.length; p < pl; p++) {
      Array.prototype.push.apply(shapes, paths[p].toShapes())
    }

    return shapes
  }
}

function createPaths(text, size, data) {
  const chars = Array.from(text)
  const scale = size / data.resolution
  const line_height = (data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness) * scale

  const paths: any[] = []

  let offsetX = 0,
    offsetY = 0

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i]

    if (char === '\n') {
      offsetX = 0
      offsetY -= line_height
    } else {
      const ret = createPath(char, scale, offsetX, offsetY, data) as any
      offsetX += ret.offsetX
      paths.push(ret.path)
    }
  }

  return paths
}

function createPath(char, scale, offsetX, offsetY, data) {
  const glyph = data.glyphs[char] || data.glyphs['?']

  if (!glyph) {
    console.error('THREE.Font: character "' + char + '" does not exists in font family ' + data.familyName + '.')

    return
  }

  const path = new ShapePath()

  let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2

  if (glyph.o) {
    const outline = glyph._cachedOutline || (glyph._cachedOutline = glyph.o.split(' '))

    for (let i = 0, l = outline.length; i < l; ) {
      const action = outline[i++]

      switch (action) {
        case 'm': // moveTo
          x = outline[i++] * scale + offsetX
          y = outline[i++] * scale + offsetY

          path.moveTo(x, y)

          break

        case 'l': // lineTo
          x = outline[i++] * scale + offsetX
          y = outline[i++] * scale + offsetY

          path.lineTo(x, y)

          break

        case 'q': // quadraticCurveTo
          cpx = outline[i++] * scale + offsetX
          cpy = outline[i++] * scale + offsetY
          cpx1 = outline[i++] * scale + offsetX
          cpy1 = outline[i++] * scale + offsetY

          path.quadraticCurveTo(cpx1, cpy1, cpx, cpy)

          break

        case 'b': // bezierCurveTo
          cpx = outline[i++] * scale + offsetX
          cpy = outline[i++] * scale + offsetY
          cpx1 = outline[i++] * scale + offsetX
          cpy1 = outline[i++] * scale + offsetY
          cpx2 = outline[i++] * scale + offsetX
          cpy2 = outline[i++] * scale + offsetY

          path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy)

          break
      }
    }
  }

  return { offsetX: glyph.ha * scale, path: path }
}
