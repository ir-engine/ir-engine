import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Texture } from 'three'

import { GrassProperties, TextureRef } from '@etherealengine/engine/src/scene/components/InstancingComponent'
import { State, useState } from '@etherealengine/hyperflux'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Collapse, IconButton, IconButtonProps } from '@mui/material'

import ColorInput from '../inputs/ColorInput'
import ImageInput from '../inputs/ImageInput'
import { ImagePreviewInputGroup } from '../inputs/ImagePreviewInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import RandomizedPropertyInputGroup from '../inputs/RandomizedPropertyInput'
import CollapsibleBlock from '../layout/CollapsibleBlock'
import ExpandMore from '../layout/ExpandMore'

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
