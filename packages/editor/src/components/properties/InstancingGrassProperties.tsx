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

import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { GrassProperties, TextureRef } from '@etherealengine/engine/src/scene/components/InstancingComponent'
import { State } from '@etherealengine/hyperflux'

import ColorInput from '../inputs/ColorInput'
import { ImagePreviewInputGroup } from '../inputs/ImagePreviewInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import RandomizedPropertyInputGroup from '../inputs/RandomizedPropertyInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'

export default function InstancingGrassProperties({
  state,
  onChange,
  ...rest
}: {
  state: State<GrassProperties>
  onChange: (value: GrassProperties) => void
}) {
  const value = state.value
  const props = value as GrassProperties

  const { t } = useTranslation()

  const texPath = (tex: TextureRef) => {
    if (tex.texture?.isTexture) return tex.texture.source.data?.src ?? ''
    return tex.src ?? ''
  }

  function onChangeGrass(val) {
    state.grassTexture.src.set(val)
  }

  function onChangeAlpha(val) {
    state.alphaMap.src.set(val)
  }

  const onChangeProp = useCallback((prop) => {
    return (_value) => {
      state[prop].set(_value)
    }
  }, [])

  return (
    <CollapsibleBlock label={t('editor:properties.instancing.grass.properties')} {...rest}>
      <RandomizedPropertyInputGroup
        name="Blade Height"
        label={t('editor:properties.instancing.grass.bladeHeight')}
        onChange={onChangeProp('bladeHeight')}
        state={state.bladeHeight}
      />
      <RandomizedPropertyInputGroup
        name="Blade Width"
        label={t('editor:properties.instancing.grass.bladeWidth')}
        onChange={onChangeProp('bladeWidth')}
        state={state.bladeWidth}
      />
      <NumericInputGroup
        name="Joints"
        label={t('editor:properties.instancing.grass.joints')}
        onChange={onChangeProp('joints')}
        value={props.joints}
        min={2}
        max={100}
        smallStep={1}
        mediumStep={2}
        largeStep={5}
      />
      <ImagePreviewInputGroup
        name="Alpha Map"
        label={t('editor:properties.instancing.grass.alphaMap')}
        onChange={onChangeAlpha}
        value={props.alphaMap.src}
      />
      <ImagePreviewInputGroup
        name="Grass Texture"
        label={t('editor:properties.instancing.grass.texture')}
        onChange={onChangeGrass}
        value={props.grassTexture.src}
      />
      <NumericInputGroup
        name="ambientStrength"
        label={t('editor:properties.instancing.grass.ambientStrength')}
        onChange={onChangeProp('ambientStrength')}
        value={props.ambientStrength}
        min={0}
        max={1}
        smallStep={0.01}
        mediumStep={0.025}
        largeStep={0.1}
      />
      <NumericInputGroup
        name="diffuseStrength"
        label={t('editor:properties.instancing.grass.diffuseStrength')}
        onChange={onChangeProp('diffuseStrength')}
        value={props.diffuseStrength}
        min={0}
        max={1}
        smallStep={0.01}
        mediumStep={0.025}
        largeStep={0.1}
      />
      <NumericInputGroup
        name="Shininess"
        label={t('editor:properties.instancing.grass.shininess')}
        onChange={onChangeProp('shininess')}
        value={props.shininess}
        min={0}
        max={512}
        smallStep={0.5}
        mediumStep={1}
        largeStep={5}
      />
      <InputGroup name="Sun Color" label={t('editor:properties.instancing.grass.sunColor')}>
        <ColorInput value={props.sunColor} onChange={onChangeProp('sunColor')} />
      </InputGroup>
    </CollapsibleBlock>
  )
}
