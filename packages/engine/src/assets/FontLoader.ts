import { FileLoader, Loader, LoadingManager, ShapePath } from 'three'

/**
* Load a font.
* @param url - URL of the font.
* @param onLoad - Callback function that is called when the font is loaded.
* @param onProgress - Callback function that is called when the font is loading.
* @param onError - Callback function that is called when the font fails to load.
* @internal
*/
export class FontLoader extends Loader {
  constructor(manager?: LoadingManager) {
    super(manager)
  }

  load(url, onLoad, onProgress?, onError?) {
    const scope = this

    const loader = new FileLoader(this.manager)
    loader.setPath(this.path)
    loader.setRequestHeader(this.requestHeader)
    loader.setWithCredentials(scope.withCredentials)
    loader.load(
      url,
      function (text: string) {
        let json

        try {
          json = JSON.parse(text)
        } catch (e) {
          console.warn('THREE.FontLoader: typeface.js support is being deprecated. Use typeface.json instead.')
          json = JSON.parse(text.substring(65, text.length - 2))
        }

        const font = scope.parse(json)

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

/**
* Font.
* @param {any} data - Data of the font.
* @param {number} size - Font size.
* @return {Array.<Shape>} - Shapes of the font.
* @throws {@link MaxListenerExceededException}
* Thrown if the event is already assigned to another listener.
* @internal
*/
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

/**
* Create a path from a character.
* @param char - Character to create a path from.
* @param scale - Scale of the character.
* @param offsetX - X offset of the character.
* @param offsetY - Y offset of the character.
* @param data - Data of the character.
* @return {@link Path} - Path created from the character.
* @internal
*/

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

/**
 * Creates a path from a character.
 * @param char - Character to create path from.
 * @param scale - Scale of the font.
 * @param offsetX - X offset of the character.
 * @param offsetY - Y offset of the character.
 * @param data - Font data.
 * @return {@link ShapePath} - Path. */
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
