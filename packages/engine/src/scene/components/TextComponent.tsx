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

/**
 * @fileoverview
 * Defines the types and logic required for using and creating Spatial Text {@link Component}s.
 */

import { useEffect } from 'react'

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import { defineComponent, useComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { useEntityContext } from '@etherealengine/ecs/src/EntityFunctions'

import { matches } from '@etherealengine/spatial/src/common/functions/MatchesUtils'
import { addObjectToGroup } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { Color, Material, MathUtils, Mesh, MeshBasicMaterial, MeshStandardMaterial, Vector2 } from 'three'
import { Text as TroikaText } from 'troika-three-text'

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

/**
 * @description
 * Defines the horizontal alignment of each line within the overall bounding box.
 * @notes troika.Text alignment type, as declared by `troika-three-text` in its Text.textAlign `@member` property.
 */
export type TroikaTextAlignment = 'left' | 'center' | 'right' | 'justify'

/**
 * @description
 * Defines whether text should wrap when a line reaches `maxWidth`.
 * - `'normal'`: Allow wrapping according to the `overflowWrap` property. Honors newline characters to manually break lines, making it behave more like `'pre-wrap'` does in CSS.
 * - `'nowrap'`: Does not allow text to wrap.
 * @notes troika.Text wrap, as declared by `troika-three-text` in its Text.whiteSpace `@member` property.
 */
export type TroikaTextWrap = 'normal' | 'nowrap'

/**
 * @description
 * Defines how text wraps if TroikaTextWrap is set to `normal` _(aka TextComponent.textWrap: true)_.
 * - `'normal'`: Break at whitespace characters
 * - `'break-word'`: Break within words
 * @notes troika.Text wrapping kind, as declared by `troika-three-text` in its Text.overflowWrap `@member` property.
 */
export type TroikaTextWrapKind = 'normal' | 'break-word'

/**
 * @description
 * Defines the format accepted for declaring the `lineHeight` property of troika.Text.
 * - `'normal'`: Chooses a reasonable height based on the chosen font's ascender/descender metrics.
 * @notes troika.Text line height format, as declared by `troika-three-text`in its Text.lineHeight `@member` property.
 */
export type TroikaTextLineHeight = number | 'normal'

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

/**
 * @description A Text Component, used to manage the state of the NodeEditor view that customizes spatial text properties.
 */
export const TextComponent = defineComponent({
  name: 'TextComponent',
  jsonID: 'Text_Spatial',

  onInit: (entity) => {
    return {
      // Text contents to render
      text: LoremIpsum,
      textOpacity: 100, // range[0..100], sent to troika as [0..1] :number
      textWidth: Infinity,
      textIndent: 0,
      textAlign: 'justify' as TroikaTextAlignment,
      textWrap: true, // Maps to: troika.Text.whiteSpace as TroikaTextWrap
      textWrapKind: 'normal' as TroikaTextWrapKind, // Maps to troika.Text.overflowWrap
      textAnchor: new Vector2(
        /* X */ 0, // range[0..100+], sent to troika as [0..100]% :string
        /* Y */ 0 // range[0..100+], sent to troika as [0..100]% :string
      ),
      textDepthOffset: 0, // For Z-fighting adjustments. Similar to anchor.Z
      textCurveRadius: 0,
      letterSpacing: 0,
      lineHeight: 'normal' as TroikaTextLineHeight,
      textDirection: 'auto' as TroikaTextDirection,

      // Font Properties
      font: FontDefault, // font: string|null
      fontSize: 0.2,
      fontColor: new Color(0xffffff),
      fontMaterial: 0 as FontMaterialKind, // Default to whatever value is marked at id=0 in FontMaterialKind
      // Font Outline Properties
      outlineOpacity: 0, // range[0..100], sent to troika as [0..1] :number
      outlineWidth: 0, // range[0..100+], sent to troika as [0..100]% :string
      outlineBlur: 0, // range[0..100+], sent to troika as [0..100]% :string
      outlineOffset: new Vector2(
        /* X */ 0, // range[0..100+], sent to troika as [0..100]% :string
        /* Y */ 0 // range[0..100+], sent to troika as [0..100]% :string
      ),
      outlineColor: new Color(0x000000),
      // Font Stroke Properties
      strokeOpacity: 0, // range[0..100], sent to troika as [0..1] :number
      strokeWidth: 0, // range[0..100+], sent to troika as [0..100]% :string
      strokeColor: new Color(0x444444),

      // Advanced Configuration
      textOrientation: '+x+y',
      clipActive: false, // sends []: Array<number> to Text.clipRect when true
      clipRectMin: new Vector2(-1024, -1024), // pixels. Sent to troika as [minX, minY, maxX, maxY] :Array<number>
      clipRectMax: new Vector2(1024, 1024), // pixels. Sent to troika as [minX, minY, maxX, maxY] :Array<number>
      gpuAccelerated: true,
      glyphResolution: 6, // Maps to troika.Text.sdfGlyphSize. Sent to troika as 2^N :number
      glyphDetail: 1, // Maps to troika.Text.glyphGeometryDetail

      // Internal State
      troikaMesh: null as TextMesh | null
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    // Text contents/properties
    if (matches.string.test(json.text)) component.text.set(json.text)
    if (matches.number.test(json.textOpacity)) component.textOpacity.set(json.textOpacity)
    if (matches.number.test(json.textWidth)) component.textWidth.set(json.textWidth)
    if (matches.number.test(json.textIndent)) component.textIndent.set(json.textIndent)
    if (matches.string.test(json.textAlign)) component.textAlign.set(json.textAlign)
    if (matches.boolean.test(json.textWrap)) component.textWrap.set(json.textWrap)
    if (matches.string.test(json.textWrapKind)) component.textWrapKind.set(json.textWrapKind)
    if (matches.object.test(json.textAnchor) && json.textAnchor.isVector2) component.textAnchor.set(json.textAnchor)
    if (matches.number.test(json.textDepthOffset)) component.textDepthOffset.set(json.textDepthOffset)
    if (matches.number.test(json.textCurveRadius)) component.textCurveRadius.set(json.textCurveRadius)
    if (matches.number.test(json.letterSpacing)) component.letterSpacing.set(json.letterSpacing)
    if (matches.number.test(json.lineHeight) || (matches.string.test(json.lineHeight) && json.lineHeight === 'normal'))
      component.lineHeight.set(json.lineHeight)
    if (matches.string.test(json.textDirection)) component.textDirection.set(json.textDirection)
    // Font Properties
    if (matches.string.test(json.font)) component.font.set(json.font)
    else if (matches.nill.test(json.font)) component.font.set(null)
    if (matches.number.test(json.fontSize)) component.fontSize.set(json.fontSize)
    if (matches.object.test(json.fontColor) && json.fontColor.isColor) component.fontColor.set(json.fontColor)
    if (matches.number.test(json.fontMaterial) && json.fontMaterial in FontMaterialKind)
      component.fontMaterial.set(json.fontMaterial)
    if (matches.number.test(json.outlineOpacity)) component.outlineOpacity.set(json.outlineOpacity)
    if (matches.number.test(json.outlineWidth)) component.outlineWidth.set(json.outlineWidth)
    if (matches.number.test(json.outlineBlur)) component.outlineBlur.set(json.outlineBlur)
    if (matches.object.test(json.outlineOffset) && json.outlineOffset.isVector2)
      component.outlineOffset.set(json.outlineOffset)
    if (matches.object.test(json.outlineColor) && json.outlineColor.isColor)
      component.outlineColor.set(json.outlineColor)
    if (matches.number.test(json.strokeOpacity)) component.strokeOpacity.set(json.strokeOpacity)
    if (matches.number.test(json.strokeWidth)) component.strokeWidth.set(json.strokeWidth)
    if (matches.object.test(json.strokeColor) && json.strokeColor.isColor) component.strokeColor.set(json.strokeColor)
    // Advanced configuration
    if (matches.string.test(json.textOrientation)) component.textOrientation.set(json.textOrientation)
    if (matches.boolean.test(json.gpuAccelerated)) component.gpuAccelerated.set(json.gpuAccelerated)
    if (matches.boolean.test(json.clipActive)) component.clipActive.set(json.clipActive)
    if (matches.object.test(json.clipRectMin) && json.clipRectMin.isVector2) component.clipRectMin.set(json.clipRectMin)
    if (matches.object.test(json.clipRectMax) && json.clipRectMax.isVector2) component.clipRectMax.set(json.clipRectMax)
    if (matches.number.test(json.glyphResolution)) component.glyphResolution.set(json.glyphResolution)
    if (matches.number.test(json.glyphDetail)) component.glyphDetail.set(json.glyphDetail)
  },

  toJSON: (entity, component) => {
    return {
      // Text contents/properties
      text: component.text.value,
      textOpacity: component.textOpacity.value,
      textWidth: component.textWidth.value,
      textIndent: component.textIndent.value,
      textAlign: component.textAlign.value,
      textWrap: component.textWrap.value,
      textWrapKind: component.textWrapKind.value,
      textAnchor: component.textAnchor.value,
      textDepthOffset: component.textDepthOffset.value,
      textCurveRadius: component.textCurveRadius.value,
      lineHeight: component.lineHeight.value,
      letterSpacing: component.letterSpacing.value,
      textDirection: component.textDirection.value,
      // Font Properties
      font: component.font.value,
      fontSize: component.fontSize.value,
      fontColor: component.fontColor.value,
      fontMaterial: component.fontMaterial.value,
      outlineOpacity: component.outlineOpacity.value,
      outlineWidth: component.outlineWidth.value,
      outlineBlur: component.outlineBlur.value,
      outlineOffset: component.outlineOffset.value,
      outlineColor: component.outlineColor.value,
      strokeOpacity: component.strokeOpacity.value,
      strokeWidth: component.strokeWidth.value,
      strokeColor: component.strokeColor.value,
      // Advanced configuration
      textOrientation: component.textOrientation.value,
      clipActive: component.clipActive.value,
      clipRectMin: component.clipRectMin.value,
      clipRectMax: component.clipRectMax.value,
      gpuAccelerated: component.gpuAccelerated.value,
      glyphResolution: component.glyphResolution.value,
      glyphDetail: component.glyphDetail.value
    }
  },

  reactor: function () {
    if (!isClient) return null
    const entity = useEntityContext()
    const text = useComponent(entity, TextComponent)

    useEffect(() => {
      text.troikaMesh.set(new TroikaText())
      addObjectToGroup(entity, text.troikaMesh.value!)
      return () => {
        text.troikaMesh.value!.dispose()
      }
    }, [])

    useEffect(() => {
      // Update the Text content/properties
      text.troikaMesh.value!.text = text.text.value
      text.troikaMesh.value!.fillOpacity = text.textOpacity.value / 100
      text.troikaMesh.value!.maxWidth = text.textWidth.value
      text.troikaMesh.value!.textIndent = text.textIndent.value
      text.troikaMesh.value!.textAlign = text.textAlign.value
      text.troikaMesh.value!.overflowWrap = text.textWrapKind.value
      text.troikaMesh.value!.whiteSpace = text.textWrap.value ? 'normal' : 'nowrap'
      text.troikaMesh.value!.anchorX = `${text.textAnchor.x.value}%`
      text.troikaMesh.value!.anchorY = `${text.textAnchor.y.value}%`
      text.troikaMesh.value!.depthOffset = text.textDepthOffset.value
      text.troikaMesh.value!.curveRadius = MathUtils.degToRad(text.textCurveRadius.value)
      text.troikaMesh.value!.letterSpacing = text.letterSpacing.value
      text.troikaMesh.value!.lineHeight = text.lineHeight.value
      text.troikaMesh.value!.direction = text.textDirection.value
      // Update the font properties
      text.troikaMesh.value!.font = text.font.value
      text.troikaMesh.value!.fontSize = text.fontSize.value
      text.troikaMesh.value!.color = text.fontColor.value.getHex()
      switch (text.fontMaterial.value) {
        case FontMaterialKind.Basic:
          text.troikaMesh.value!.material = new MeshBasicMaterial()
          break
        case FontMaterialKind.Standard:
          text.troikaMesh.value!.material = new MeshStandardMaterial()
          break
      }
      text.troikaMesh.value!.outlineOpacity = text.outlineOpacity.value / 100
      text.troikaMesh.value!.outlineWidth = `${text.outlineWidth.value}%`
      text.troikaMesh.value!.outlineBlur = `${text.outlineBlur.value}%`
      text.troikaMesh.value!.outlineOffsetX = `${text.outlineOffset.x.value}%`
      text.troikaMesh.value!.outlineOffsetY = `${text.outlineOffset.y.value}%`
      text.troikaMesh.value!.outlineColor = text.outlineColor.value.getHex()
      text.troikaMesh.value!.strokeOpacity = text.strokeOpacity.value / 100
      text.troikaMesh.value!.strokeWidth = `${text.strokeWidth.value}%`
      text.troikaMesh.value!.strokeColor = text.strokeColor.value.getHex()
      // Update the Advanced configuration propertiess
      text.troikaMesh.value!.orientation = text.textOrientation.value
      ;(text.troikaMesh.value!.clipRect = text.clipActive.value
        ? [
            // Send as [minX, minY, maxX, maxY] :Array<number>
            text.clipRectMin.x.value,
            text.clipRectMin.y.value,
            text.clipRectMax.x.value,
            text.clipRectMax.x.value
          ]
        : []),
        (text.troikaMesh.value!.gpuAccelerateSDF = text.gpuAccelerated.value)
      text.troikaMesh.value!.sdfGlyphSize = Math.pow(2, text.glyphResolution.value)
      text.troikaMesh.value!.glyphGeometryDetail = text.glyphDetail.value
      // Order troika to synchronize the mesh
      text.troikaMesh.value!.sync()
    }, [
      text.text,
      text.textOpacity,
      text.textIndent,
      text.textAlign,
      text.textWrap,
      text.textWrapKind,
      text.textAnchor,
      text.textCurveRadius,
      text.textDepthOffset,
      text.textWidth,
      text.lineHeight,
      text.letterSpacing,
      text.textDirection,
      text.fontSize,
      text.fontColor,
      text.fontMaterial,
      text.outlineOpacity,
      text.outlineWidth,
      text.outlineBlur,
      text.outlineOffset,
      text.outlineColor,
      text.strokeOpacity,
      text.strokeWidth,
      text.strokeColor,
      text.textOrientation,
      text.clipActive,
      text.clipRectMin,
      text.clipRectMax,
      text.gpuAccelerated,
      text.glyphResolution,
      text.glyphDetail
    ])

    return null
  }
})
