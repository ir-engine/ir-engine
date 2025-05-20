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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

/**
 * @fileoverview
 * Defines the types and logic required for using and creating Spatial Text {@link Component}s.
 */
import { useEffect, useRef } from 'react'
import {
  Color,
  ColorRepresentation,
  Material,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Vector2
} from 'three'
import { Text as TroikaText } from 'troika-three-text'

import { useEntityContext } from '@ir-engine/ecs'
import { defineComponent, removeComponent, setComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { isClient } from '@ir-engine/hyperflux'
import { ObjectComponent } from '@ir-engine/spatial/src/renderer/components/ObjectComponent'
import { T } from '@ir-engine/spatial/src/schema/schemaFunctions'

/**
 * @description
 * troika.Color type, as declared by `troika-three-text` in its Text.color `@member` property.
 */
type TroikaColor = string | number | Color

/**
 * @description
 * - `auto`: Chooses text direction based on the text contents.
 * - `ltr`: Text will have a left-to-right direction.
 * - `rtl`: Text will have a right-to-left direction.
 * @notes troika.Text direction type, as declared by `troika-three-text` in its Text.direction `@member` property.
 */
export type TroikaTextDirection = 'auto' | 'ltr' | 'rtl'
const TroikaTextDirectionSchema = S.LiteralUnion(['auto', 'ltr', 'rtl'])

/**
 * @description
 * Defines the horizontal alignment of each line within the overall bounding box.
 * @notes troika.Text alignment type, as declared by `troika-three-text` in its Text.textAlign `@member` property.
 */
export type TroikaTextAlignment = 'left' | 'center' | 'right' | 'justify'
const TroikaTextAlignmentSchema = S.LiteralUnion(['left', 'center', 'right', 'justify'], { default: 'justify' })

/**
 * @description
 * Defines whether text should wrap when a line reaches `maxWidth`.
 * - `'normal'`: Allow wrapping according to the `overflowWrap` property. Honors newline characters to manually break lines, making it behave more like `'pre-wrap'` does in CSS.
 * - `'nowrap'`: Does not allow text to wrap.
 * @notes troika.Text wrap, as declared by `troika-three-text` in its Text.whiteSpace `@member` property.
 */
export type TroikaTextWrap = 'normal' | 'nowrap'
const TroikaTextWrapSchema = S.LiteralUnion(['normal', 'nowrap'])

/**
 * @description
 * Defines how text wraps if TroikaTextWrap is set to `normal` _(aka TextComponent.textWrap: true)_.
 * - `'normal'`: Break at whitespace characters
 * - `'break-word'`: Break within words
 * @notes troika.Text wrapping kind, as declared by `troika-three-text` in its Text.overflowWrap `@member` property.
 */
export type TroikaTextWrapKind = 'normal' | 'break-word'
const TroikaTextWrapKindSchema = S.LiteralUnion(['normal', 'break-word'])

/**
 * @description
 * Defines the format accepted for declaring the `lineHeight` property of troika.Text.
 * - `'normal'`: Chooses a reasonable height based on the chosen font's ascender/descender metrics.
 * @notes troika.Text line height format, as declared by `troika-three-text`in its Text.lineHeight `@member` property.
 */
export type TroikaTextLineHeight = number | 'normal'
const TroikaTextLineHeightSchema = S.Union([S.Number(), S.Literal('normal')], { default: 'normal' })

/**
 * @summary
 * Javascript-to-Typescript compatiblity type for the `troika-three-text` {@link Text} mesh class.
 *
 * @example
 * import { Text as TroikaText } from 'troika-three-text'
import { hasComponent } from '../../../../ecs/src/ComponentFunctions';
 * let textMesh = new TroikaText() as TextMesh
 *
 * @note
 * Go to the `troika-three-text`.Text class implementation for documentation about each of the fields.
 *
 * @description
 * Respects the shape of the original troika.{@link Text} class,
 * by intersecting the three.{@link Mesh} class with an explicit list of properties originally contained in the Text class.
 * Only the properties used by this implementation are explicitly declared in this type.
 */
type TextMesh = Mesh & {
  //____ Text layout properties ____
  text: string
  // Text properties
  fillOpacity: number // @note: Troika marks this as an Experimental API
  textIndent: number /** Indentation for the first character of a line; see CSS `text-indent`. */
  textAlign: TroikaTextAlignment
  overflowWrap: TroikaTextWrapKind
  whiteSpace: TroikaTextWrap
  letterSpacing: number /** Spacing between letters after kerning is applied. */
  lineHeight: TroikaTextLineHeight /** Height of each line of text as a multiple of `fontSize`. */
  maxWidth: number /** Value above which text starts wrapping */
  anchorX: number | string | 'left' | 'center' | 'right'
  anchorY: number | string | 'top' | 'top-baseline' | 'top-cap' | 'top-ex' | 'middle' | 'bottom-baseline' | 'bottom'
  depthOffset: number
  curveRadius: number
  direction: TroikaTextDirection
  // Font properties
  font: string | null /** Defaults to Noto Sans when null */
  fontSize: number
  color: TroikaColor /** aka fontColor */
  material: Material
  outlineOpacity: number // @note: Troika marks this as an Experimental API
  outlineWidth: number | string // @note: Troika marks this as an Experimental API
  outlineBlur: number | string // @note: Troika marks this as an Experimental API
  outlineOffsetX: number | string // @note: Troika marks this as an Experimental API
  outlineOffsetY: number | string // @note: Troika marks this as an Experimental API
  outlineColor: TroikaColor // @note: Troika marks this as an Experimental API
  strokeOpacity: number // @note: Troika marks this as an Experimental API
  strokeWidth: number | string // @note: Troika marks this as an Experimental API
  strokeColor: TroikaColor // @note: Troika marks this as an Experimental API
  //____ Advanced Properties ____
  orientation: string /** Axis plane on which the text is laid out. @default '+x+y' */
  clipRect: Array<number> // Clipping Rectangle expressed as `[minX, minY, maxX, maxY]`
  gpuAccelerateSDF: boolean // Allows force-disabling GPU acceleration of SDF. Uses the JS fallback when true
  glyphGeometryDetail: number // Number of vertical/horizontal segments that make up each glyph's rectangular plane. Defaults to 1.
  sdfGlyphSize: number | null // Size of each glyph's SDF. Must be a power-of-two.
  //____ Callbacks ____
  sync: () => void /** Async Render the text using the current properties. troika accepts a callback function, but that feature is not mapped */
  dispose: () => void /** Async function to release the Text Mesh from the GPU. It doesn't release the Material. */
}

/**
 * @description
 * Ordinal selector for interpreting which THREE.Material to select for font rendering.
 * - `Basic`: Maps to THREE.MeshBasicMaterial
 * - `Standard`: Maps to THREE.MeshStandardMaterial
 */
export enum FontMaterialKind {
  Basic,
  Standard
}

/**
 *  @description
 *  Noto Sans is the default font for text rendering.
 *  @notes troika.Text.font accepts a nullable string URI (URL or path), and defaults to Noto Sans when null is passed
 */
const FontDefault = null! as string | null

/**
 * @description Lorem Ipsum filler text
 */
const LoremIpsum =
  "Cat ipsum dolor sit amet, munch, munch, chomp, chomp go crazy with excitement when plates are clanked together signalling the arrival of cat food lounge in doorway. Rub face on everything i like to spend my days sleeping and eating fishes that my human fished for me we live on a luxurious yacht, sailing proudly under the sun, i like to walk on the deck, watching the horizon, dreaming of a good bowl of milk yet ooooh feather moving feather! for rub my belly hiss. I see a bird i stare at it i meow at it i do a wiggle come here birdy kick up litter but ignore the squirrels, you'll never catch them anyway meow in empty rooms i like big cats and i can not lie. At four in the morning wake up owner meeeeeeooww scratch at legs and beg for food then cry and yowl until they wake up at two pm jump on window and sleep while observing the bootyful cat next door that u really like but who already has a boyfriend end up making babies with her and let her move in scream at teh bath so leave hair on owner's clothes. If human is on laptop sit on the keyboard haha you hold me hooman i scratch, cough furball into food bowl then scratch owner for a new one make muffins, so kick up litter let me in let me out let me in let me out let me in let me out who broke this door anyway . See owner, run in terror cats are cute show belly and steal mom's crouton while she is in the bathroom so skid on floor, crash into wall ."

const DefaultText = 'type your text here'
/**
 * @description A Text Component, used to manage the state of the NodeEditor view that customizes spatial text properties.
 */

const toTroikaColor = (color: ColorRepresentation): TroikaColor => {
  return typeof color === 'number' ? color : new Color(color).getHex()
}

export const TextComponent = defineComponent({
  name: 'TextComponent',
  jsonID: 'EE_text_spatial',

  schema: S.Object({
    // Text contents to render
    text: S.String({ default: DefaultText }),
    textOpacity: S.Number({ default: 100, minimum: 0, maximum: 100 }), // range[0..100], sent to troika as [0..1] :number
    textWidth: S.Number({ default: Infinity }),
    textIndent: S.Number({ default: 0 }),
    textAlign: TroikaTextAlignmentSchema,
    textWrap: S.Bool({ default: true }), // Maps to: troika.Text.whiteSpace as TroikaTextWrap
    textWrapKind: TroikaTextWrapKindSchema, // Maps to troika.Text.overflowWrap
    textAnchor: T.Vec2(), // range[0..100+], sent to troika as [0..100]% :string
    textDepthOffset: S.Number({ default: 0 }), // For Z-fighting adjustments. Similar to anchor.Z
    textCurveRadius: S.Number({ default: 0 }),
    letterSpacing: S.Number({ default: 0 }),
    lineHeight: TroikaTextLineHeightSchema,
    textDirection: TroikaTextDirectionSchema,

    // Font Properties
    font: S.String({ default: '' }), // font: string|null
    fontSize: S.Number({ default: 0.2 }),
    fontColor: T.Color(0xffffff),
    fontMaterial: S.Enum(FontMaterialKind, {
      $comment: "An indexed enum, ie. the numeric index of a value in the following sequence: 'Basic', 'Standard'",
      default: FontMaterialKind.Basic
    }), // Default to whatever value is marked at id=0 in FontMaterialKind
    // Font Outline Properties
    outlineOpacity: S.Number({ default: 0, minimum: 0, maximum: 100 }), // range[0..100], sent to troika as [0..1] :number
    outlineWidth: S.Number({ default: 0, minimum: 0, maximum: 100 }), // range[0..100+], sent to troika as [0..100]% :string
    outlineBlur: S.Number({ default: 0, minimum: 0, maximum: 100 }), // range[0..100+], sent to troika as [0..100]% :string
    outlineOffset: T.Vec2(new Vector2(0, 0)), // range[0..100+], sent to troika as [0..100]% :string
    outlineColor: T.Color(0xffffff),
    // Font Stroke Properties
    strokeOpacity: S.Number({ default: 0, minimum: 0, maximum: 100 }), // range[0..100], sent to troika as [0..1] :number
    strokeWidth: S.Number({ default: 0, minimum: 0, maximum: 100 }), // range[0..100+], sent to troika as [0..100]% :string
    strokeColor: T.Color(0x444444),

    // Advanced Configuration
    textOrientation: S.String({ default: '+x+y' }),
    clipActive: S.Bool({ default: false }), // sends []: Array<number> to Text.clipRect when true
    clipRectMin: T.Vec2(new Vector2(-1024, -1024)), // pixels. Sent to troika as [minX, minY, maxX, maxY] :Array<number>
    clipRectMax: T.Vec2(new Vector2(1024, 1024)), // pixels. Sent to troika as [minX, minY, maxX, maxY] :Array<number>
    gpuAccelerated: S.Bool({ default: true }),
    glyphResolution: S.Number({ default: 6 }), // Maps to troika.Text.sdfGlyphSize. Sent to troika as 2^N :number
    glyphDetail: S.Number({ default: 1 }) // Maps to troika.Text.glyphGeometryDetail
  }),

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const text = useComponent(entity, TextComponent)

    const troikaMeshRef = useRef<TroikaText | null>(null)
    let troikaMesh: TroikaText | null

    useEffect(() => {
      //due to current "GL_INVALID_OPERATION: Insufficient buffer size." errors preventing the text mesh's text from being updated, implementing dispose and re-setup dependent on the text update to circumvent issue
      if (troikaMesh) {
        troikaMesh.dispose()
      }

      troikaMesh = new TroikaText()
      setComponent(entity, ObjectComponent, troikaMesh)
      troikaMeshRef.current = troikaMesh

      return () => {
        removeComponent(entity, ObjectComponent)
        troikaMesh.dispose()
      }
    }, [text.text])

    useEffect(() => {
      troikaMeshRef.current.text = text.text.value
      troikaMeshRef.current.sync()
    }, [text.text])

    useEffect(() => {
      troikaMeshRef.current.fillOpacity = text.textOpacity.value / 100
      troikaMeshRef.current.sync()
    }, [text.textOpacity])

    useEffect(() => {
      troikaMeshRef.current.textIndent = text.textIndent.value
      troikaMeshRef.current.sync()
    }, [text.textIndent])

    useEffect(() => {
      troikaMeshRef.current.textAlign = text.textAlign.value
      troikaMeshRef.current.sync()
    }, [text.textAlign])

    useEffect(() => {
      troikaMeshRef.current.whiteSpace = text.textWrap.value ? 'normal' : 'nowrap'
      troikaMeshRef.current.sync()
    }, [text.textWrap])

    useEffect(() => {
      troikaMeshRef.current.overflowWrap = text.textWrapKind.value
      troikaMeshRef.current.sync()
    }, [text.textWrapKind])

    useEffect(() => {
      troikaMeshRef.current.anchorX = `${text.textAnchor.x.value}%`
      troikaMeshRef.current.anchorY = `${text.textAnchor.y.value}%`
      troikaMeshRef.current.sync()
    }, [text.textAnchor])

    useEffect(() => {
      troikaMeshRef.current.curveRadius = MathUtils.degToRad(text.textCurveRadius.value)
      troikaMeshRef.current.sync()
    }, [text.textCurveRadius])

    useEffect(() => {
      troikaMeshRef.current.depthOffset = text.textDepthOffset.value
      troikaMeshRef.current.sync()
    }, [text.textDepthOffset])

    useEffect(() => {
      troikaMeshRef.current.maxWidth = text.textWidth.value
      troikaMeshRef.current.sync()
    }, [text.textWidth])

    useEffect(() => {
      troikaMeshRef.current.lineHeight = text.lineHeight.value
      troikaMeshRef.current.sync()
    }, [text.lineHeight])

    useEffect(() => {
      troikaMeshRef.current.letterSpacing = text.letterSpacing.value
      troikaMeshRef.current.sync()
    }, [text.letterSpacing])

    useEffect(() => {
      troikaMeshRef.current.direction = text.textDirection.value
      if (text.textDirection.value === 'rtl') {
        troikaMeshRef.current.text = '\u202E' + text.text.value
      }
      troikaMeshRef.current.sync()
    }, [text.textDirection])

    useEffect(() => {
      troikaMeshRef.current.font = text.font.value
      troikaMeshRef.current.sync()
    }, [text.font])

    useEffect(() => {
      troikaMeshRef.current.fontSize = text.fontSize.value
      troikaMeshRef.current.sync()
    }, [text.fontSize])

    useEffect(() => {
      troikaMeshRef.current.color = toTroikaColor(text.fontColor.value)
      troikaMeshRef.current.sync()
    }, [text.fontColor])

    useEffect(() => {
      switch (text.fontMaterial.value) {
        case FontMaterialKind.Basic:
          troikaMeshRef.current.material = new MeshBasicMaterial()
          break
        case FontMaterialKind.Standard:
          troikaMeshRef.current.material = new MeshStandardMaterial()
          break
      }
      troikaMeshRef.current.sync()
    }, [text.fontMaterial])

    useEffect(() => {
      troikaMeshRef.current.outlineOpacity = text.outlineOpacity.value / 100
      troikaMeshRef.current.sync()
    }, [text.outlineOpacity])

    useEffect(() => {
      troikaMeshRef.current.outlineWidth = `${text.outlineWidth.value}%`
      troikaMeshRef.current.sync()
    }, [text.outlineWidth])

    useEffect(() => {
      troikaMeshRef.current.outlineBlur = `${text.outlineBlur.value}%`
      troikaMeshRef.current.sync()
    }, [text.outlineBlur])

    useEffect(() => {
      troikaMeshRef.current.outlineOffsetX = `${text.outlineOffset.x.value}%`
      troikaMeshRef.current.outlineOffsetY = `${text.outlineOffset.y.value}%`
      troikaMeshRef.current.sync()
    }, [text.outlineOffset])

    useEffect(() => {
      troikaMeshRef.current.outlineColor = toTroikaColor(text.outlineColor.value)
      troikaMeshRef.current.sync()
    }, [text.outlineColor])

    useEffect(() => {
      troikaMeshRef.current.strokeOpacity = text.strokeOpacity.value / 100
      troikaMeshRef.current.sync()
    }, [text.strokeOpacity])

    useEffect(() => {
      troikaMeshRef.current.strokeWidth = `${text.strokeWidth.value}%`
      troikaMeshRef.current.sync()
    }, [text.strokeWidth])

    useEffect(() => {
      troikaMeshRef.current.strokeColor = toTroikaColor(text.strokeColor.value)
      troikaMeshRef.current.sync()
    }, [text.strokeColor])

    useEffect(() => {
      troikaMeshRef.current.orientation = text.textOrientation.value
      troikaMeshRef.current.sync()
    }, [text.textOrientation])

    useEffect(() => {
      troikaMeshRef.current.clipRect = text.clipActive.value
        ? [
            // Send as [minX, minY, maxX, maxY] :Array<number>
            text.clipRectMin.x.value,
            text.clipRectMin.y.value,
            text.clipRectMax.x.value,
            text.clipRectMax.x.value
          ]
        : []
      troikaMeshRef.current.sync()
    }, [text.clipActive, text.clipRectMin, text.clipRectMax])

    useEffect(() => {
      troikaMeshRef.current.gpuAccelerateSDF = text.gpuAccelerated.value
      troikaMeshRef.current.sync()
    }, [text.gpuAccelerated])

    useEffect(() => {
      troikaMeshRef.current.sdfGlyphSize = Math.pow(2, text.glyphResolution.value)
      troikaMeshRef.current.sync()
    }, [text.glyphResolution])

    useEffect(() => {
      troikaMeshRef.current.glyphGeometryDetail = text.glyphDetail.value
      troikaMeshRef.current.sync()
    }, [text.glyphDetail])

    return null
  }
})
