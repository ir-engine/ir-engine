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

import { useEffect } from 'react'

import { isClient } from '@etherealengine/engine/src/common/functions/getEnvironment'
import { defineComponent, useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { useEntityContext } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'

import { Color, Mesh } from 'three'
import { Text as TroikaText } from 'troika-three-text'
import { matches } from '../../common/functions/MatchesUtils'
import { addObjectToGroup } from './GroupComponent'

/**
 * @description
 * troika.Color type, as declared by `troika-three-text` in its Text.color `@member` declaration
 */
type TroikaColor = string | number | THREE.Color

/**
 * @description
 * Type for Javascript-to-Typescript compatiblity of the `troika-three-text` Text mesh class.
 *
 * @example
 * import { Text as TroikaText } from 'troika-three-text'
 * let textMesh = new TroikaText() as TextMesh
 *
 * @abstract
 * Respects the shape of the original troika.Text class,
 * by intersecting the three.Mesh class with an explicit list of properties originally contained in the Text class.
 * Only the properties used by this implementation are explicitly declared.
 * @note
 * Go to the `troika-three-text`.Text class implementation for documentation about each of the fields.
 */
type TextMesh = Mesh & {
  /* --- Text layout properties: --- */
  text: string
  fontSize: number
  /* --- Presentation properties: --- */
  color: TroikaColor
  sync: () => void /* Async Render the text using the current properties. troika accepts a callback function, but that feature is not mapped */

  //__________
  //  TODO  //
  //_______//
  /**
   * @member {number|string} anchorX
   * Defines the horizontal position in the text block that should line up with the local origin.
   * Can be specified as a numeric x position in local units, a string percentage of the total
   * text block width e.g. `'25%'`, or one of the following keyword strings: 'left', 'center',
   * or 'right'.
   */
  anchorX: number | string

  /**
   * @member {number|string} anchorY
   * Defines the vertical position in the text block that should line up with the local origin.
   * Can be specified as a numeric y position in local units (note: down is negative y), a string
   * percentage of the total text block height e.g. `'25%'`, or one of the following keyword strings:
   * 'top', 'top-baseline', 'top-cap', 'top-ex', 'middle', 'bottom-baseline', or 'bottom'.
   */
  anchorY: number | string

  /**
   * @member {number} curveRadius
   * Defines a cylindrical radius along which the text's plane will be curved. Positive numbers put
   * the cylinder's centerline (oriented vertically) that distance in front of the text, for a concave
   * curvature, while negative numbers put it behind the text for a convex curvature. The centerline
   * will be aligned with the text's local origin; you can use `anchorX` to offset it.
   *
   * Since each glyph is by default rendered with a simple quad, each glyph remains a flat plane
   * internally. You can use `glyphGeometryDetail` to add more vertices for curvature inside glyphs.
   */
  curveRadius: number

  /**
   * @member {string} direction
   * Sets the base direction for the text. The default value of "auto" will choose a direction based
   * on the text's content according to the bidi spec. A value of "ltr" or "rtl" will force the direction.
   */
  direction: 'auto' | 'ltr' | 'rtl'

  /**
   * @member {string|null} font
   * URL of a custom font to be used. Font files can be in .ttf, .otf, or .woff (not .woff2) formats.
   * Defaults to Noto Sans.
   */
  font: string | null /** Defaults to Noto Sans */
  unicodeFontsURL: string | null //defaults to CDN

  /**
   * @member {number|'normal'|'bold'}
   * The weight of the font. Currently only used for fallback Noto fonts.
   */
  fontWeight: number | 'normal' | 'bold'

  /**
   * @member {'normal'|'italic'}
   * The style of the font. Currently only used for fallback Noto fonts.
   */
  fontStyle: 'normal' | 'italic'

  /**
   * @member {string|null} lang
   * The language code of this text; can be used for explicitly selecting certain CJK fonts.
   */
  lang: string | null

  /**
   * @member {number} letterSpacing
   * Sets a uniform adjustment to spacing between letters after kerning is applied. Positive
   * numbers increase spacing and negative numbers decrease it.
   */
  letterSpacing: number

  /**
   * @member {number|string} lineHeight
   * Sets the height of each line of text, as a multiple of the `fontSize`. Defaults to 'normal'
   * which chooses a reasonable height based on the chosen font's ascender/descender metrics.
   */
  lineHeight: number | 'normal'

  /**
   * @member {number} maxWidth
   * The maximum width of the text block, above which text may start wrapping according to the
   * `whiteSpace` and `overflowWrap` properties.
   */
  maxWidth: number

  /**
   * @member {string} overflowWrap
   * Defines how text wraps if the `whiteSpace` property is `normal`. Can be either `'normal'`
   * to break at whitespace characters, or `'break-word'` to allow breaking within words.
   * Defaults to `'normal'`.
   */
  overflowWrap: 'normal' | 'break-word'

  /**
   * @member {string} textAlign
   * The horizontal alignment of each line of text within the overall text bounding box.
   */
  textAlign: 'left' | 'center' | 'right' | 'justify'

  /**
   * @member {number} textIndent
   * Indentation for the first character of a line; see CSS `text-indent`.
   */
  textIndent: number

  /**
   * @member {string} whiteSpace
   * Defines whether text should wrap when a line reaches the `maxWidth`. Can
   * be either `'normal'` (the default), to allow wrapping according to the `overflowWrap` property,
   * or `'nowrap'` to prevent wrapping. Note that `'normal'` here honors newline characters to
   * manually break lines, making it behave more like `'pre-wrap'` does in CSS.
   */
  whiteSpace: 'normal' | 'nowrap'

  // === Presentation properties: === //

  /**
   * @member {THREE.Material} material
   * Defines a _base_ material to be used when rendering the text. This material will be
   * automatically replaced with a material derived from it, that adds shader code to
   * decrease the alpha for each fragment (pixel) outside the text glyphs, with antialiasing.
   * By default it will derive from a simple white MeshBasicMaterial, but you can use any
   * of the other mesh materials to gain other features like lighting, texture maps, etc.
   *
   * Also see the `color` shortcut property.
   */
  material: THREE.Material

  /**
   * @member {object|null} colorRanges
   * WARNING: This API is experimental and may change.
   * This allows more fine-grained control of colors for individual or ranges of characters,
   * taking precedence over the material's `color`. Its format is an Object whose keys each
   * define a starting character index for a range, and whose values are the color for each
   * range. The color value can be a numeric hex color value, a `THREE.Color` object, or
   * any of the strings accepted by `THREE.Color`.
   */
  colorRanges: object | null

  /**
   * @member {number|string} outlineWidth
   * WARNING: This API is experimental and may change.
   * The width of an outline/halo to be drawn around each text glyph using the `outlineColor` and `outlineOpacity`.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g.
   * `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`, which means
   * no outline will be drawn unless an `outlineOffsetX/Y` or `outlineBlur` is set.
   */
  outlineWidth: number | string

  /**
   * @member {string|number|THREE.Color} outlineColor
   * WARNING: This API is experimental and may change.
   * The color of the text outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
   * Defaults to black.
   */
  outlineColor: TroikaColor

  /**
   * @member {number} outlineOpacity
   * WARNING: This API is experimental and may change.
   * The opacity of the outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
   * Defaults to `1`.
   */
  outlineOpacity: number

  /**
   * @member {number|string} outlineBlur
   * WARNING: This API is experimental and may change.
   * A blur radius applied to the outer edge of the text's outline. If the `outlineWidth` is
   * zero, the blur will be applied at the glyph edge, like CSS's `text-shadow` blur radius.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g.
   * `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`.
   */
  outlineBlur: number | string

  /**
   * @member {number|string} outlineOffsetX
   * WARNING: This API is experimental and may change.
   * A horizontal offset for the text outline.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
   * which is treated as a percentage of the `fontSize`. Defaults to `0`.
   */
  outlineOffsetX: number | string

  /**
   * @member {number|string} outlineOffsetY
   * WARNING: This API is experimental and may change.
   * A vertical offset for the text outline.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
   * which is treated as a percentage of the `fontSize`. Defaults to `0`.
   */
  outlineOffsetY: number | string

  /**
   * @member {number|string} strokeWidth
   * WARNING: This API is experimental and may change.
   * The width of an inner stroke drawn inside each text glyph using the `strokeColor` and `strokeOpacity`.
   * Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
   * which is treated as a percentage of the `fontSize`. Defaults to `0`.
   */
  strokeWidth: number | string

  /**
   * @member {string|number|THREE.Color} strokeColor
   * WARNING: This API is experimental and may change.
   * The color of the text stroke, if `strokeWidth` is greater than zero. Defaults to gray.
   */
  strokeColor: TroikaColor

  /**
   * @member {number} strokeOpacity
   * WARNING: This API is experimental and may change.
   * The opacity of the stroke, if `strokeWidth` is greater than zero. Defaults to `1`.
   */
  strokeOpacity: number

  /**
   * @member {number} fillOpacity
   * WARNING: This API is experimental and may change.
   * The opacity of the glyph's fill from 0 to 1. This behaves like the material's `opacity` but allows
   * giving the fill a different opacity than the `strokeOpacity`. A fillOpacity of `0` makes the
   * interior of the glyph invisible, leaving just the `strokeWidth`. Defaults to `1`.
   */
  fillOpacity: number

  /**
   * @member {number} depthOffset
   * This is a shortcut for setting the material's `polygonOffset` and related properties,
   * which can be useful in preventing z-fighting when this text is laid on top of another
   * plane in the scene. Positive numbers are further from the camera, negatives closer.
   */
  depthOffset: number

  /**
   * @member {Array<number>} clipRect
   * If specified, defines a `[minX, minY, maxX, maxY]` of a rectangle outside of which all
   * pixels will be discarded. This can be used for example to clip overflowing text when
   * `whiteSpace='nowrap'`.
   */
  clipRect: Array<number>

  /**
   * @member {string} orientation
   * Defines the axis plane on which the text should be laid out when the mesh has no extra
   * rotation transform. It is specified as a string with two axes: the horizontal axis with
   * positive pointing right, and the vertical axis with positive pointing up. By default this
   * is '+x+y', meaning the text sits on the xy plane with the text's top toward positive y
   * and facing positive z. A value of '+x-z' would place it on the xz plane with the text's
   * top toward negative z and facing positive y.
   */
  orientation: string

  /**
   * @member {number} glyphGeometryDetail
   * Controls number of vertical/horizontal segments that make up each glyph's rectangular
   * plane. Defaults to 1. This can be increased to provide more geometrical detail for custom
   * vertex shader effects, for example.
   */
  glyphGeometryDetail: number

  /**
   * @member {number|null} sdfGlyphSize
   * The size of each glyph's SDF (signed distance field) used for rendering. This must be a
   * power-of-two number. Defaults to 64 which is generally a good balance of size and quality
   * for most fonts. Larger sizes can improve the quality of glyph rendering by increasing
   * the sharpness of corners and preventing loss of very thin lines, at the expense of
   * increased memory footprint and longer SDF generation time.
   */
  sdfGlyphSize: number | null

  /**
   * @member {boolean} gpuAccelerateSDF
   * When `true`, the SDF generation process will be GPU-accelerated with WebGL when possible,
   * making it much faster especially for complex glyphs, and falling back to a JavaScript version
   * executed in web workers when support isn't available. It should automatically detect support,
   * but it's still somewhat experimental, so you can set it to `false` to force it to use the JS
   * version if you encounter issues with it.
   */
  gpuAccelerateSDF: boolean
  debugSDF: boolean
}

export const TextComponent = defineComponent({
  name: 'TextComponent',
  jsonID: 'Text_troika',

  onInit: (entity) => {
    return {
      // Text properties to configure
      text: 'Some Text',
      fontSize: 0.2,
      fontColor: new Color(0x9966ff),
      troikaMesh: new TroikaText() as TextMesh
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.string.test(json.text)) component.text.set(json.text)
    if (matches.number.test(json.fontSize)) component.fontSize.set(json.fontSize)
    if (matches.object.test(json.fontColor) && json.fontColor.isColor) component.fontColor.set(json.fontColor)
  },

  toJSON: (entity, component) => {
    return {
      text: component.text.value,
      fontSize: component.fontSize.value,
      fontColor: component.fontColor.value
    }
  },

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const text = useComponent(entity, TextComponent)

    // Add the text mesh to the scene
    addObjectToGroup(entity, text.troikaMesh.value)

    useEffect(() => {
      // Update the rendering
      text.troikaMesh.value.text = text.text.value
      text.troikaMesh.value.fontSize = text.fontSize.value
      text.troikaMesh.value.color = text.fontColor.value.getHex()
      text.troikaMesh.value.sync()
    }, [text.text, text.fontSize, text.fontColor])

    /* Reactive system
    useExecute(() => {}, { with: InputSystemGroup })
    */

    return null
  }
})
