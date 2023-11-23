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
 * Javascript-to-Typescript compatiblity type for the `troika-three-text` Text mesh class.
 *
 * @example
 * import { Text as TroikaText } from 'troika-three-text'
 * let textMesh = new TroikaText() as TextMesh
 *
 * @note
 * Go to the `troika-three-text`.Text class implementation for documentation about each of the fields.
 *
 * @abstract
 * Respects the shape of the original troika.Text class,
 * by intersecting the three.Mesh class with an explicit list of properties originally contained in the Text class.
 * Only the properties used by this implementation are explicitly declared in this type.
 */
type TextMesh = Mesh & {
  //____ Text layout properties ____
  text: string
  font: string | null /** Defaults to Noto Sans when null */
  fontSize: number
  //____ Presentation properties ____
  color: TroikaColor /** aka fontColor */
  sync: () => void /** Async Render the text using the current properties. troika accepts a callback function, but that feature is not mapped */

  //____ WIP ____
  textIndent: number /** Indentation for the first character of a line; see CSS `text-indent`. */

  //____ Simple Properties
  // Defines a cylindrical radius along which the text's plane will be curved. Positive numbers put
  // the cylinder's centerline (oriented vertically) that distance in front of the text, for a concave
  // curvature, while negative numbers put it behind the text for a convex curvature. The centerline
  // will be aligned with the text's local origin; you can use `anchorX` to offset it.
  // Since each glyph is by default rendered with a simple quad, each glyph remains a flat plane
  // internally. You can use `glyphGeometryDetail` to add more vertices for curvature inside glyphs.
  curveRadius: number
  // Sets a uniform adjustment to spacing between letters after kerning is applied.
  // Positive numbers increase spacing and negative numbers decrease it.
  letterSpacing: number
  // The maximum width of the text block, above which text may start wrapping according to the
  // `whiteSpace` and `overflowWrap` properties.
  maxWidth: number
  // The color of the text outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
  // Defaults to black.
  outlineColor: TroikaColor // WARNING: This API is experimental and may change.
  // The width of an outline/halo to be drawn around each text glyph using the `outlineColor` and `outlineOpacity`.
  // Can be specified as either an absolute number in local units, or as a percentage string e.g.
  // `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`, which means
  // no outline will be drawn unless an `outlineOffsetX/Y` or `outlineBlur` is set.
  outlineWidth: number | string // WARNING: This API is experimental and may change.
  // The color of the text stroke, if `strokeWidth` is greater than zero. Defaults to gray.
  strokeColor: TroikaColor // WARNING: This API is experimental and may change.
  // The opacity of the stroke, if `strokeWidth` is greater than zero. Defaults to `1`.
  strokeOpacity: number // WARNING: This API is experimental and may change.
  // The opacity of the glyph's fill from 0 to 1. This behaves like the material's `opacity` but allows
  // giving the fill a different opacity than the `strokeOpacity`. A fillOpacity of `0` makes the
  // interior of the glyph invisible, leaving just the `strokeWidth`. Defaults to `1`.
  fillOpacity: number // WARNING: This API is experimental and may change.
  // This is a shortcut for setting the material's `polygonOffset` and related properties,
  // which can be useful in preventing z-fighting when this text is laid on top of another
  // plane in the scene. Positive numbers are further from the camera, negatives closer.
  depthOffset: number
  // If specified, defines a `[minX, minY, maxX, maxY]` of a rectangle outside of which all
  // pixels will be discarded. This can be used for example to clip overflowing text when
  // `whiteSpace='nowrap'`.
  clipRect: Array<number>

  //____ SDF & Geometry ____
  // Controls number of vertical/horizontal segments that make up each glyph's rectangular
  // plane. Defaults to 1. This can be increased to provide more geometrical detail for custom
  // vertex shader effects, for example.
  glyphGeometryDetail: number
  // The size of each glyph's SDF (signed distance field) used for rendering. This must be a
  // power-of-two number. Defaults to 64 which is generally a good balance of size and quality
  // for most fonts. Larger sizes can improve the quality of glyph rendering by increasing
  // the sharpness of corners and preventing loss of very thin lines, at the expense of
  // increased memory footprint and longer SDF generation time.
  sdfGlyphSize: number | null
  // When `true`, the SDF generation process will be GPU-accelerated with WebGL when possible,
  // making it much faster especially for complex glyphs, and falling back to a JavaScript version
  // executed in web workers when support isn't available. It should automatically detect support,
  // but it's still somewhat experimental, so you can set it to `false` to force it to use the JS
  // version if you encounter issues with it.
  gpuAccelerateSDF: boolean

  //_____________________________________________________________
  // TODO                                                      //
  //  Remove the unused properties. Only temp for easier dev  //
  //_________________________________________________________//
  // Defines the position in the text block that should line up with the local origin.
  // Can be specified as a numeric x position in local units, a string percentage of the total
  // text block width e.g. `'25%'`, or one of the allowed keyword strings
  anchorX: number | string | 'left' | 'center' | 'right'
  anchorY: number | string | 'top' | 'top-baseline' | 'top-cap' | 'top-ex' | 'middle' | 'bottom-baseline' | 'bottom'
  // Sets the base direction for the text. The default value of "auto" will choose a direction based
  // on the text's content according to the bidi spec. A value of "ltr" or "rtl" will force the direction.
  direction: 'auto' | 'ltr' | 'rtl'
  // Sets the height of each line of text, as a multiple of the `fontSize`. Defaults to 'normal'
  // which chooses a reasonable height based on the chosen font's ascender/descender metrics.
  lineHeight: number | 'normal'
  // Defines how text wraps if the `whiteSpace` property is `normal`. Can be either `'normal'`
  // to break at whitespace characters, or `'break-word'` to allow breaking within words.
  // Defaults to `'normal'`.
  overflowWrap: 'normal' | 'break-word'
  // The horizontal alignment of each line of text within the overall text bounding box.
  textAlign: 'left' | 'center' | 'right' | 'justify'
  // Defines whether text should wrap when a line reaches the `maxWidth`.
  // Can be `'normal'` (the default), to allow wrapping according to the `overflowWrap` property,
  // or `'nowrap'` to prevent wrapping.
  // Note that `'normal'` here honors newline characters to manually break lines, making it behave more like `'pre-wrap'` does in CSS.
  whiteSpace: 'normal' | 'nowrap'

  // === Presentation properties: === //
  // Defines a _base_ material to be used when rendering the text. This material will be
  // automatically replaced with a material derived from it, that adds shader code to
  // decrease the alpha for each fragment (pixel) outside the text glyphs, with antialiasing.
  // By default it will derive from a simple white MeshBasicMaterial, but you can use any
  // of the other mesh materials to gain other features like lighting, texture maps, etc.
  // Also see the `color` shortcut property.
  material: THREE.Material
  // This allows more fine-grained control of colors for individual or ranges of characters,
  // taking precedence over the material's `color`. Its format is an Object whose keys each
  // define a starting character index for a range, and whose values are the color for each
  // range. The color value can be a numeric hex color value, a `THREE.Color` object, or
  // any of the strings accepted by `THREE.Color`.
  colorRanges: object | null // WARNING: This API is experimental and may change.
  // The opacity of the outline, if `outlineWidth`/`outlineBlur`/`outlineOffsetX/Y` are set.
  // Defaults to `1`.
  outlineOpacity: number // WARNING: This API is experimental and may change.
  // A blur radius applied to the outer edge of the text's outline. If the `outlineWidth` is
  // zero, the blur will be applied at the glyph edge, like CSS's `text-shadow` blur radius.
  // Can be specified as either an absolute number in local units, or as a percentage string e.g.
  // `"12%"` which is treated as a percentage of the `fontSize`. Defaults to `0`.
  outlineBlur: number | string // WARNING: This API is experimental and may change.
  // An offset for the text outline.
  // Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
  // which is treated as a percentage of the `fontSize`. Defaults to `0`.
  outlineOffsetX: number | string // WARNING: This API is experimental and may change.
  outlineOffsetY: number | string // WARNING: This API is experimental and may change.
  // The width of an inner stroke drawn inside each text glyph using the `strokeColor` and `strokeOpacity`.
  // Can be specified as either an absolute number in local units, or as a percentage string e.g. `"12%"`
  // which is treated as a percentage of the `fontSize`. Defaults to `0`.
  strokeWidth: number | string // WARNING: This API is experimental and may change.
  // Defines the axis plane on which the text should be laid out when the mesh has no extra
  // rotation transform. It is specified as a string with two axes: the horizontal axis with
  // positive pointing right, and the vertical axis with positive pointing up. By default this
  // is '+x+y', meaning the text sits on the xy plane with the text's top toward positive y
  // and facing positive z. A value of '+x-z' would place it on the xz plane with the text's
  // top toward negative z and facing positive y.
  orientation: string

  //____ Unlikely ____
  fontWeight: number | 'normal' | 'bold' // The weight of the font. Currently only used for fallback Noto fonts.
  fontStyle: 'normal' | 'italic' // The style of the font. Currently only used for fallback Noto fonts.
  lang: string | null // The language code of this text; can be used for explicitly selecting certain CJK fonts.
  unicodeFontsURL: string | null // defaults to CDN
  debugSDF: boolean
}

/**
 *  @description
 *  Noto Sans is the default font for text rendering.
 *  @abstract
 *  troika.Text.font accepts a nullable string, and defaults to Noto Sans when null is passed
 */
const FontDefault = null! as string | null
/** @todo Remove. Only temp for testing */
const FontOrbitronURL = 'https://fonts.gstatic.com/s/orbitron/v9/yMJRMIlzdpvBhQQL_Qq7dys.woff'

export const TextComponent = defineComponent({
  name: 'TextComponent',
  jsonID: 'Text_troika',

  onInit: (entity) => {
    return {
      // Text contents to render
      text: 'Some Text',
      textIndent: 0,
      // Font Properties
      font: FontDefault, // font: string|null
      fontSize: 0.2,
      fontColor: new Color(0x9966ff),
      // Internal State
      troikaMesh: new TroikaText() as TextMesh
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    // Text contents to render
    if (matches.string.test(json.text)) component.text.set(json.text)
    if (matches.number.test(json.textIndent)) component.textIndent.set(json.textIndent)
    // Font Properties
    if (matches.string.test(json.font)) component.font.set(json.font)
    else if (matches.nill.test(json.font)) component.font.set(null)
    if (matches.number.test(json.fontSize)) component.fontSize.set(json.fontSize)
    if (matches.object.test(json.fontColor) && json.fontColor.isColor) component.fontColor.set(json.fontColor)
  },

  toJSON: (entity, component) => {
    return {
      // Text contents to render
      text: component.text.value,
      textIndent: component.textIndent.value,
      // Font Properties
      font: component.font.value,
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
      // Update the Text content to render
      text.troikaMesh.value.text = text.text.value
      text.troikaMesh.value.textIndent = text.textIndent.value
      // Update the font properties
      text.troikaMesh.value.font = text.font.value
      text.troikaMesh.value.fontSize = text.fontSize.value
      text.troikaMesh.value.color = text.fontColor.value.getHex()
      // Order troika to syncrhonize the mesh
      text.troikaMesh.value.sync()
    }, [text.text, text.textIndent, text.fontSize, text.fontColor])

    /* Reactive system
    useExecute(() => {}, { with: InputSystemGroup })
    */

    return null
  }
})
