import React, { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Texture } from 'three'

import { GrassProperties } from '@xrengine/engine/src/scene/components/InstancingComponent'

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

export default function InstancingGrassProperties({ value, onChange, ...rest }) {
  const props = value as GrassProperties

  const { t } = useTranslation()

  const texPath = (tex) => {
    if ((tex as Texture).isTexture) return tex.source.data?.src ?? ''
    if (typeof tex === 'string') return tex
    console.error('unknown texture type for', tex)
  }

  const [grass, setGrass] = useState(texPath(props.grassTexture))
  const [alpha, setAlpha] = useState(texPath(props.alphaMap))

  function onChangeGrass(val) {
    setGrass(val)
    props.grassTexture = val
    onChange(props)
  }

  function onChangeAlpha(val) {
    setAlpha(val)
    props.alphaMap = val
    onChange(props)
  }

  function onChangeProp(prop) {
    return (_value) => {
      props[prop] = _value
      onChange(props)
    }
  }

  return (
    <CollapsibleBlock label={t('editor:properties.instancing.grass.properties')}>
      <RandomizedPropertyInputGroup
        name="Blade Height"
        label={t('editor:properties.instancing.grass.bladeHeight')}
        onChange={onChangeProp('bladeHeight')}
        value={props.bladeHeight}
      />
      <RandomizedPropertyInputGroup
        name="Blade Width"
        label={t('editor:properties.instancing.grass.bladeWidth')}
        onChange={onChangeProp('bladeWidth')}
        value={props.bladeWidth}
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
        value={alpha}
      />
      <ImagePreviewInputGroup
        name="Grass Texture"
        label={t('editor:properties.instancing.grass.texture')}
        onChange={onChangeGrass}
        value={grass}
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
