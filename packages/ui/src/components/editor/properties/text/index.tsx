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
 * Defines the {@link NodeEditor} UI for managing {@link TextComponent}s in the Studio.
 */

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { PiTextT } from 'react-icons/pi'

import { useComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import {
  FontMaterialKind,
  TextComponent,
  TroikaTextAlignment,
  TroikaTextLineHeight
} from '@ir-engine/engine/src/scene/components/TextComponent'
import { useHookstate } from '@ir-engine/hyperflux'
import { Checkbox } from '@ir-engine/ui'
import { ColorInput } from '../../../../primitives/tailwind/Color'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import { ControlledStringInput } from '../../input/String'
import Vector2Input from '../../input/Vector2'
import { FontOption, fonts } from './fonts'

/**
 * @description SelectInput option groups for the TextNodeEditor UI tsx code.
 * @private Stored `@local` scope of the file, so it only exists once and its not GC'ed when the component is used.
 */
const SelectOptions = {
  TextDirection: [
    { label: 'Auto', value: 'auto' },
    { label: 'Left to Right', value: 'ltr' },
    { label: 'Right to Left', value: 'rtl' }
  ],
  TextAlignment: [
    { label: 'Left', value: 'left' },
    { label: 'Center', value: 'center' },
    { label: 'Right', value: 'right' }
  ],
  TextWrapping: [
    { label: 'Whitespace', value: 'normal' },
    { label: 'Break Word', value: 'break-word' }
  ],
  Font: fonts as FontOption[],
  FontMaterial: [
    { label: 'Basic', value: FontMaterialKind.Basic },
    { label: 'Standard', value: FontMaterialKind.Standard }
  ]
}

/**
 * @description Default fallback value for when when text.lineheight is not set to 'normal'
 */
const LineHeightNumericDefault = 1.2 as TroikaTextLineHeight

const HoverInfo = {
  FontFamily: `
URL of a custom font to be used. Font files can be in .ttf, .otf, or .woff (not .woff2) formats. Defaults to Noto Sans when empty.
Example:   https://fonts.gstatic.com/s/orbitron/v9/yMJRMIlzdpvBhQQL_Qq7dys.woff
`,
  AdvancedGroup: `
Toggle Advanced options. Only modify these if you know what you are doing.
`,
  TextOrientation: `
Defines the axis plane on which the text should be laid out when the mesh has no extra rotation transform.
It is specified as a string with two axes:
  1. the horizontal axis with positive pointing right,
  2. the vertical axis with positive pointing up.
Defaults to '+x+y', meaning the text sits on the xy plane with the text's top toward positive y and facing positive z.
A value of '+x-z' would place it on the xz plane with the text's top toward negative z and facing positive y.
`,
  Clipping: `
Limit the range of pixels to draw to the given clip Rectangle.
Directly tied to the axis selection @textOrientation.
Useful for when text wrapping is disabled, but text should still be contained within a certain range.
`,
  GlyphResolution: `
Level of quality at which font glyphs are rasterized.
Compare values 2 and 3 to understand how this value behaves.
A value of 4 is already acceptable quality depending on context. A value of 6 is great quality, very difficult to distinguish from 7.
Anything above 9-10 could literally halt your computer while the text is being rendered.
`,
  GlyphDetail: `
Number of subdivisions of the plane Mesh where the text is being rendered. Useful for material effects.
`,
  GPUAccelerated: `
Forces the text rendering to happen on the CPU when disabled.
Text rendering performance is significantly slower when disabled.
Only useful for hardware that has no GPU acceleration support.
`
}

/**
 * TextNodeEditor component used to provide the editor a view to customize text properties.
 */
export const TextNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const text = useComponent(props.entity, TextComponent)
  const advancedActive = useHookstate(false) // State tracking whether the Advanced Options Section is active or not

  // initialize default values
  useEffect(() => {
    if (text.lineHeight.value === undefined) {
      text.lineHeight.set(LineHeightNumericDefault) // 1.2 em
    }
    if (text.outlineOpacity.value === undefined) {
      text.outlineOpacity.set(100) // 100%
    }
    if (text.outlineWidth.value === undefined) {
      text.outlineWidth.set(3) // 3px
    }
    if (text.textAlign.value === undefined) {
      text.textAlign.set('left')
    }

    if (text.font.value === undefined) {
      const defaultFont = SelectOptions.Font.find((option) => option.label === 'Noto Sans')
      if (defaultFont) {
        text.font.set(defaultFont.value)
      }
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.text.name')}
      description={t('editor:properties.text.description')}
      Icon={TextNodeEditor.iconComponent}
    >
      <InputGroup name="TextContents" label="Contents">
        <ControlledStringInput
          value={text.text.value}
          onChange={updateProperty(TextComponent, 'text')}
          onRelease={commitProperty(TextComponent, 'text')}
        />
      </InputGroup>
      <InputGroup name="TextGroup" label={t('editor:properties.text.textGroup')}>
        <div>
          <InputGroup name="TextOpacity" label={t('editor:properties.text.textOpacity')}>
            <NumericInput
              min={0}
              max={100}
              smallStep={1}
              mediumStep={5}
              largeStep={10}
              value={text.textOpacity.value}
              onChange={updateProperty(TextComponent, 'textOpacity')}
              onRelease={commitProperty(TextComponent, 'textOpacity')}
              unit="%"
            />
          </InputGroup>
          <InputGroup name="TextWidth" label={t('editor:properties.text.textWidth')}>
            <NumericInput
              min={0}
              smallStep={0.01}
              mediumStep={0.1}
              largeStep={0.5}
              value={text.textWidth.value}
              onChange={updateProperty(TextComponent, 'textWidth')}
              onRelease={commitProperty(TextComponent, 'textWidth')}
              unit="em"
            />
          </InputGroup>
          <InputGroup name="TextIndent" label={t('editor:properties.text.textIndent')}>
            <NumericInput
              min={0}
              smallStep={0.01}
              mediumStep={0.1}
              largeStep={0.5}
              value={text.textIndent.value}
              onChange={updateProperty(TextComponent, 'textIndent')}
              onRelease={commitProperty(TextComponent, 'textIndent')}
              unit="em"
            />
          </InputGroup>

          <InputGroup name="TextAlign" label={t('editor:properties.text.textAlign')}>
            <SelectInput
              options={SelectOptions.TextAlignment}
              value={text.textAlign.value}
              onChange={(value) => commitProperty(TextComponent, 'textAlign')(value.toString() as TroikaTextAlignment)}
            />
          </InputGroup>
          <InputGroup name="TextWrap" label={t('editor:properties.text.textWrap')}>
            <Checkbox checked={text.textWrap.value} onChange={commitProperty(TextComponent, 'textWrap')} />
          </InputGroup>
          <InputGroup name="TextAnchor" label={t('editor:properties.text.textAnchor')}>
            <Vector2Input
              min={0}
              max={100}
              value={text.textAnchor.value}
              onChange={updateProperty(TextComponent, 'textAnchor')}
              onRelease={commitProperty(TextComponent, 'textAnchor')}
            />
          </InputGroup>
          {/* <InputGroup name="TextDepthOffset" label={t('editor:properties.text.textDepthOffset')}>
            <NumericInput
              smallStep={0.01}
              mediumStep={0.1}
              largeStep={0.25}
              value={text.textDepthOffset.value}
              onChange={updateProperty(TextComponent, 'textDepthOffset')}
              onRelease={commitProperty(TextComponent, 'textDepthOffset')}
              unit="px"
            /> */}
          <InputGroup name="TextCurveRadius" label={t('editor:properties.text.textCurveRadius')}>
            <NumericInput
              smallStep={1}
              mediumStep={5}
              largeStep={15}
              value={text.textCurveRadius.value}
              onChange={updateProperty(TextComponent, 'textCurveRadius')}
              onRelease={commitProperty(TextComponent, 'textCurveRadius')}
              unit="deg"
            />
          </InputGroup>
          <InputGroup name="LetterSpacing" label={t('editor:properties.text.letterSpacing')}>
            <NumericInput
              min={-0.5}
              smallStep={0.01}
              mediumStep={0.1}
              largeStep={0.2}
              value={text.letterSpacing.value}
              onChange={updateProperty(TextComponent, 'letterSpacing')}
              onRelease={commitProperty(TextComponent, 'letterSpacing')}
              unit="px"
            />
          </InputGroup>
          <InputGroup name="LineHeight" label={t('editor:properties.text.lineHeight')}>
            <NumericInput
              min={0}
              smallStep={0.01}
              mediumStep={0.1}
              largeStep={0.2}
              value={text.lineHeight.value as number}
              onChange={updateProperty(TextComponent, 'lineHeight')}
              onRelease={commitProperty(TextComponent, 'lineHeight')}
              unit="em"
            />
          </InputGroup>
          <InputGroup name="TextDirection" label={t('editor:properties.text.textDirection')}>
            <SelectInput
              options={SelectOptions.TextDirection}
              value={text.textDirection.value}
              onChange={commitProperty(TextComponent, 'textDirection')}
            />
          </InputGroup>
        </div>
      </InputGroup>
      <br></br>
      <InputGroup name="Font" label={t('editor:properties.text.fontGroup')}>
        <SelectInput
          options={SelectOptions.Font}
          value={text.font.value || ''}
          onChange={(value) => commitProperty(TextComponent, 'font')(value.toString())}
        />
      </InputGroup>
      <InputGroup name="FontSize" label={t('editor:properties.text.fontSize')}>
        <NumericInput
          min={0}
          smallStep={0.01}
          mediumStep={0.1}
          largeStep={0.5}
          value={text.fontSize.value}
          onChange={updateProperty(TextComponent, 'fontSize')}
          onRelease={commitProperty(TextComponent, 'fontSize')}
          unit="em"
        />
      </InputGroup>
      <InputGroup name="FontColor" label={t('editor:properties.text.fontColor')}>
        <ColorInput
          value={text.fontColor.value}
          onChange={commitProperty(TextComponent, 'fontColor')}
          //onRelease={commitProperty(TextComponent, 'fontColor')}
        />
      </InputGroup>
      <InputGroup name="FontMaterial" label={t('editor:properties.text.fontMaterial')}>
        <SelectInput
          options={SelectOptions.FontMaterial}
          value={text.fontMaterial.value}
          onChange={commitProperty(TextComponent, 'fontMaterial')}
          //onRelease={commitProperty(TextComponent, 'fontMaterial')}
        />
      </InputGroup>
      <br></br>
      <InputGroup name="OutlineGroup" label={t('editor:properties.text.outlineGroup')}>
        <div>
          <InputGroup name="OutlineColor" label={t('editor:properties.text.outlineColor')}>
            <ColorInput
              value={text.outlineColor.value}
              onChange={updateProperty(TextComponent, 'outlineColor')}
              onRelease={commitProperty(TextComponent, 'outlineColor')}
            />
          </InputGroup>
          <InputGroup name="OutlineOpacity" label={t('editor:properties.text.outlineOpacity')}>
            <NumericInput
              min={0}
              max={100}
              smallStep={1}
              mediumStep={2}
              largeStep={5}
              value={text.outlineOpacity.value}
              onChange={updateProperty(TextComponent, 'outlineOpacity')}
              onRelease={commitProperty(TextComponent, 'outlineOpacity')}
              unit="%"
            />
          </InputGroup>
          <InputGroup name="OutlineWidth" label={t('editor:properties.text.outlineWidth')}>
            <NumericInput
              min={0}
              smallStep={0.5}
              mediumStep={1}
              largeStep={2}
              value={text.outlineWidth.value}
              onChange={updateProperty(TextComponent, 'outlineWidth')}
              onRelease={commitProperty(TextComponent, 'outlineWidth')}
              unit="px"
            />
          </InputGroup>
          <InputGroup name="OutlineBlur" label={t('editor:properties.text.outlineBlur')}>
            <NumericInput
              min={0}
              smallStep={1}
              mediumStep={2}
              largeStep={5}
              value={text.outlineBlur.value}
              onChange={updateProperty(TextComponent, 'outlineBlur')}
              onRelease={commitProperty(TextComponent, 'outlineBlur')}
              unit="px"
            />
          </InputGroup>
          <InputGroup name="OutlineOffset" label={t('editor:properties.text.outlineOffset')}>
            <Vector2Input
              value={text.outlineOffset.value}
              onChange={updateProperty(TextComponent, 'outlineOffset')}
              onRelease={commitProperty(TextComponent, 'outlineOffset')}
            />
          </InputGroup>
        </div>
      </InputGroup>
      <br></br>
      <InputGroup name="StrokeGroup" label={t('editor:properties.text.strokeGroup')}>
        <div>
          <InputGroup name="StrokeColor" label={t('editor:properties.text.strokeColor')}>
            <ColorInput
              value={text.strokeColor.value}
              onChange={updateProperty(TextComponent, 'strokeColor')}
              onRelease={commitProperty(TextComponent, 'strokeColor')}
            />
          </InputGroup>
          <InputGroup name="StrokeOpacity" label={t('editor:properties.text.strokeOpacity')}>
            <NumericInput
              min={0}
              max={100}
              smallStep={1}
              mediumStep={2}
              largeStep={10}
              value={text.strokeOpacity.value}
              onChange={updateProperty(TextComponent, 'strokeOpacity')}
              onRelease={commitProperty(TextComponent, 'strokeOpacity')}
              unit="%"
            />
          </InputGroup>
          <InputGroup name="StrokeWidth" label={t('editor:properties.text.strokeWidth')}>
            <NumericInput
              min={0}
              smallStep={0.5}
              mediumStep={1}
              largeStep={2}
              value={text.strokeWidth.value}
              onChange={updateProperty(TextComponent, 'strokeWidth')}
              onRelease={commitProperty(TextComponent, 'strokeWidth')}
              unit="%"
            />
          </InputGroup>
        </div>
      </InputGroup>
      <br></br>
      <InputGroup
        name="AdvancedActive"
        label={t('editor:properties.text.advancedActive')}
        info={HoverInfo.AdvancedGroup}
      >
        <Checkbox checked={advancedActive.value} onChange={advancedActive.set} />
      </InputGroup>
      {advancedActive.value ? (
        /*Show Advanced Options only when Active*/
        <InputGroup name="AdvancedGroup" label={t('editor:properties.text.advancedGroup')}>
          <div>
            <InputGroup name="TextOrientation" label="textOrientation" info={HoverInfo.TextOrientation}>
              <ControlledStringInput
                value={text.textOrientation.value}
                onChange={updateProperty(TextComponent, 'textOrientation')}
                onRelease={commitProperty(TextComponent, 'textOrientation')}
              />
            </InputGroup>
            <InputGroup
              name="ClippingActive"
              label={t('editor:properties.text.clippingActive')}
              info={HoverInfo.Clipping}
            >
              <Checkbox checked={text.clipActive.value} onChange={commitProperty(TextComponent, 'clipActive')} />
            </InputGroup>
            <InputGroup
              disabled={!text.clipActive.value}
              name="ClippingMin"
              label={t('editor:properties.text.clippingMin')}
            >
              <Vector2Input
                value={text.clipRectMin.value}
                onChange={updateProperty(TextComponent, 'clipRectMin')}
                onRelease={commitProperty(TextComponent, 'clipRectMin')}
              />
            </InputGroup>
            <InputGroup
              disabled={!text.clipActive.value}
              name="ClippingMax"
              label={t('editor:properties.text.clippingMax')}
            >
              <Vector2Input
                value={text.clipRectMax.value}
                onChange={updateProperty(TextComponent, 'clipRectMax')}
                onRelease={commitProperty(TextComponent, 'clipRectMax')}
              />
            </InputGroup>
            <InputGroup
              name="GlyphResolution"
              label={t('editor:properties.text.glyphResolution')}
              info={HoverInfo.GlyphResolution}
            >
              <NumericInput
                min={1}
                max={8}
                smallStep={1}
                mediumStep={1}
                largeStep={2}
                value={text.glyphResolution.value}
                onChange={updateProperty(TextComponent, 'glyphResolution')}
                onRelease={commitProperty(TextComponent, 'glyphResolution')}
                unit="2^N"
              />
            </InputGroup>
            <InputGroup name="GlyphDetail" label={t('editor:properties.text.glyphDetail')} info={HoverInfo.GlyphDetail}>
              <NumericInput
                min={1}
                smallStep={1}
                mediumStep={1}
                largeStep={1}
                value={text.glyphDetail.value}
                onChange={updateProperty(TextComponent, 'glyphDetail')}
                onRelease={commitProperty(TextComponent, 'glyphDetail')}
                unit="subdiv"
              />
            </InputGroup>
            <InputGroup
              name="GPUAccelerated"
              label={t('editor:properties.text.gpuAccelerated')}
              info={HoverInfo.GPUAccelerated}
            >
              <Checkbox
                checked={text.gpuAccelerated.value}
                onChange={commitProperty(TextComponent, 'gpuAccelerated')}
              />
            </InputGroup>
          </div>
        </InputGroup>
      ) : (
        <>{/*advanced.inactive*/}</>
      )}
    </NodeEditor>
  )
}

TextNodeEditor.iconComponent = PiTextT

export default TextNodeEditor
