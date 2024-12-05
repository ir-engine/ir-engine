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

/**
 * @fileoverview
 * Defines the types and logic required for using and creating Spatial Text {@link Component}s.
 */

import { useEffect } from 'react'
import { Color, ColorRepresentation, Material, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { Text as TroikaText } from 'troika-three-text'

import { defineComponent, useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { isClient } from '@ir-engine/hyperflux'
import { addObjectToGroup } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
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
const TroikaTextDirectionSchema = S.LiteralUnion(['auto', 'ltr', 'rtl'], 'auto')

/**
 * @description
 * Defines the horizontal alignment of each line within the overall bounding box.
 * @notes troika.Text alignment type, as declared by `troika-three-text` in its Text.textAlign `@member` property.
 */
export type TroikaTextAlignment = 'left' | 'center' | 'right' | 'justify'
const TroikaTextAlignmentSchema = S.LiteralUnion(['left', 'center', 'right', 'justify'], 'left')

/**
 * @description
 * Defines whether text should wrap when a line reaches `maxWidth`.
 * - `'normal'`: Allow wrapping according to the `overflowWrap` property. Honors newline characters to manually break lines, making it behave more like `'pre-wrap'` does in CSS.
 * - `'nowrap'`: Does not allow text to wrap.
 * @notes troika.Text wrap, as declared by `troika-three-text` in its Text.whiteSpace `@member` property.
 */
export type TroikaTextWrap = 'normal' | 'nowrap'
const TroikaTextWrapSchema = S.LiteralUnion(['normal', 'nowrap'], 'normal')

/**
 * @description
 * Defines how text wraps if TroikaTextWrap is set to `normal` _(aka TextComponent.textWrap: true)_.
 * - `'normal'`: Break at whitespace characters
 * - `'break-word'`: Break within words
 * @notes troika.Text wrapping kind, as declared by `troika-three-text` in its Text.overflowWrap `@member` property.
 */
export type TroikaTextWrapKind = 'normal' | 'break-word'
const TroikaTextWrapKindSchema = S.LiteralUnion(['normal', 'break-word'], 'normal')

/**
 * @description
 * Defines the format accepted for declaring the `lineHeight` property of troika.Text.
 * - `'normal'`: Chooses a reasonable height based on the chosen font's ascender/descender metrics.
 * @notes troika.Text line height format, as declared by `troika-three-text`in its Text.lineHeight `@member` property.
 */
export type TroikaTextLineHeight = number | 'normal'
const TroikaTextLineHeightSchema = S.Union([S.Number(), S.Literal('normal')], 'normal')

/**
 * @summary
 * Javascript-to-Typescript compatiblity type for the `troika-three-text` {@link Text} mesh class.
 *
 * @example
 * import { Text as TroikaText } from 'troika-three-text'
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
    text: S.String(DefaultText),
    textOpacity: S.Number(100, { minimum: 0, maximum: 100 }), // range[0..100], sent to troika as [0..1] :number
    textWidth: S.Number(Infinity),
    textIndent: S.Number(0),
    textAlign: TroikaTextAlignmentSchema,
    textWrap: S.Bool(true), // Maps to: troika.Text.whiteSpace as TroikaTextWrap
    textWrapKind: TroikaTextWrapKindSchema, // Maps to troika.Text.overflowWrap
    textAnchor: T.Vec2({ x: 0, y: 100 }), // range[0..100+], sent to troika as [0..100]% :string
    textDepthOffset: S.Number(0), // For Z-fighting adjustments. Similar to anchor.Z
    textCurveRadius: S.Number(0),
    letterSpacing: S.Number(0),
    lineHeight: TroikaTextLineHeightSchema,
    textDirection: TroikaTextDirectionSchema,

    // Font Properties
    font: S.Nullable(S.String()), // font: string|null
    fontSize: S.Number(0.2),
    fontColor: T.Color(0xffffff),
    fontMaterial: S.Enum(FontMaterialKind, FontMaterialKind.Basic), // Default to whatever value is marked at id=0 in FontMaterialKind
    // Font Outline Properties
    outlineOpacity: S.Number(100, { minimum: 0, maximum: 100 }), // range[0..100], sent to troika as [0..1] :number
    outlineWidth: S.Number(100, { minimum: 0, maximum: 100 }), // range[0..100+], sent to troika as [0..100]% :string
    outlineBlur: S.Number(100, { minimum: 0, maximum: 100 }), // range[0..100+], sent to troika as [0..100]% :string
    outlineOffset: T.Vec2({ x: 0, y: 100 }), // range[0..100+], sent to troika as [0..100]% :string
    outlineColor: T.Color(0x000000),
    // Font Stroke Properties
    strokeOpacity: S.Number(100, { minimum: 0, maximum: 100 }), // range[0..100], sent to troika as [0..1] :number
    strokeWidth: S.Number(100, { minimum: 0, maximum: 100 }), // range[0..100+], sent to troika as [0..100]% :string
    strokeColor: T.Color(0x444444),

    // Advanced Configuration
    textOrientation: S.String('+x+y'),
    clipActive: S.Bool(false), // sends []: Array<number> to Text.clipRect when true
    clipRectMin: T.Vec2({ x: -1024, y: -1024 }), // pixels. Sent to troika as [minX, minY, maxX, maxY] :Array<number>
    clipRectMax: T.Vec2({ x: 1024, y: 1024 }), // pixels. Sent to troika as [minX, minY, maxX, maxY] :Array<number>
    gpuAccelerated: S.Bool(true),
    glyphResolution: S.Number(6), // Maps to troika.Text.sdfGlyphSize. Sent to troika as 2^N :number
    glyphDetail: S.Number(1), // Maps to troika.Text.glyphGeometryDetail

    // Internal State
    troikaMesh: S.Nullable(S.Type<TextMesh>())
  }),

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const text = useComponent(entity, TextComponent)

    useEffect(() => {
      text.troikaMesh.set(new TroikaText())
      addObjectToGroup(entity, text.troikaMesh.value as TextMesh)
      return () => {
        text.troikaMesh.value!.dispose()
      }
    }, [])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.text = text.text.value
      troikaMesh.sync()
    }, [text.text])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.fillOpacity = text.textOpacity.value / 100
      troikaMesh.sync()
    }, [text.textOpacity])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.textIndent = text.textIndent.value
      troikaMesh.sync()
    }, [text.textIndent])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.textAlign = text.textAlign.value
      troikaMesh.sync()
    }, [text.textAlign])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.whiteSpace = text.textWrap.value ? 'normal' : 'nowrap'
      troikaMesh.sync()
    }, [text.textWrap])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.overflowWrap = text.textWrapKind.value
      troikaMesh.sync()
    }, [text.textWrapKind])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.anchorX = `${text.textAnchor.x.value}%`
      troikaMesh.anchorY = `${text.textAnchor.y.value}%`
      troikaMesh.sync()
    }, [text.textAnchor])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.curveRadius = MathUtils.degToRad(text.textCurveRadius.value)
      troikaMesh.sync()
    }, [text.textCurveRadius])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.depthOffset = text.textDepthOffset.value
      troikaMesh.sync()
    }, [text.textDepthOffset])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.maxWidth = text.textWidth.value
      troikaMesh.sync()
    }, [text.textWidth])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.lineHeight = text.lineHeight.value
      troikaMesh.sync()
    }, [text.lineHeight])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.letterSpacing = text.letterSpacing.value
      troikaMesh.sync()
    }, [text.letterSpacing])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.direction = text.textDirection.value
      troikaMesh.sync()
    }, [text.textDirection])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.font = text.font.value
      troikaMesh.sync()
    }, [text.font])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.fontSize = text.fontSize.value
      troikaMesh.sync()
    }, [text.fontSize])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.color = toTroikaColor(text.fontColor.value)
      troikaMesh.sync()
    }, [text.fontColor])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      switch (text.fontMaterial.value) {
        case FontMaterialKind.Basic:
          troikaMesh.material = new MeshBasicMaterial()
          break
        case FontMaterialKind.Standard:
          troikaMesh.material = new MeshStandardMaterial()
          break
      }
      troikaMesh.sync()
    }, [text.fontMaterial])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.outlineOpacity = text.outlineOpacity.value / 100
      troikaMesh.sync()
    }, [text.outlineOpacity])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.outlineWidth = `${text.outlineWidth.value}%`
      troikaMesh.sync()
    }, [text.outlineWidth])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.outlineBlur = `${text.outlineBlur.value}%`
      troikaMesh.sync()
    }, [text.outlineBlur])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.outlineOffsetX = `${text.outlineOffset.x.value}%`
      troikaMesh.outlineOffsetY = `${text.outlineOffset.y.value}%`
      troikaMesh.sync()
    }, [text.outlineOffset])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.outlineColor = toTroikaColor(text.outlineColor.value)
      troikaMesh.sync()
    }, [text.outlineColor])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.strokeOpacity = text.strokeOpacity.value / 100
      troikaMesh.sync()
    }, [text.strokeOpacity])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.strokeWidth = `${text.strokeWidth.value}%`
      troikaMesh.sync()
    }, [text.strokeWidth])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.strokeColor = toTroikaColor(text.strokeColor.value)
      troikaMesh.sync()
    }, [text.strokeColor])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.orientation = text.textOrientation.value
      troikaMesh.sync()
    }, [text.textOrientation])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.clipRect = text.clipActive.value
        ? [
            // Send as [minX, minY, maxX, maxY] :Array<number>
            text.clipRectMin.x.value,
            text.clipRectMin.y.value,
            text.clipRectMax.x.value,
            text.clipRectMax.x.value
          ]
        : []
      troikaMesh.sync()
    }, [text.clipActive, text.clipRectMin, text.clipRectMax])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.gpuAccelerateSDF = text.gpuAccelerated.value
      troikaMesh.sync()
    }, [text.gpuAccelerated])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.sdfGlyphSize = Math.pow(2, text.glyphResolution.value)
      troikaMesh.sync()
    }, [text.glyphResolution])

    useEffect(() => {
      const troikaMesh = text.troikaMesh.value! as TextMesh
      troikaMesh.glyphGeometryDetail = text.glyphDetail.value
      troikaMesh.sync()
    }, [text.glyphDetail])

    return null
  }
})
