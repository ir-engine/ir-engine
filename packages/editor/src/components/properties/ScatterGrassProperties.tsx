import React, { Fragment, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Texture } from 'three'

import { GrassProperties } from '@xrengine/engine/src/scene/components/ScatterComponent'

import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Box, Collapse, IconButton, IconButtonProps, styled } from '@mui/material'

import ColorInput from '../inputs/ColorInput'
import ImageInput from '../inputs/ImageInput'
import { ImagePreviewInputGroup } from '../inputs/ImagePreviewInput'
import InputGroup from '../inputs/InputGroup'
import NumericInputGroup from '../inputs/NumericInputGroup'
import RandomizedPropertyInputGroup from '../inputs/RandomizedPropertyInput'

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props
  return <IconButton {...other} />
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}))

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean
}

export default function ScatterGrassProperties({ value, onChange, ...rest }) {
  const props = value as GrassProperties
  const [expanded, setExpanded] = useState(true)

  const { t } = useTranslation()
  const toggleExpanded = () => setExpanded(!expanded)

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
    <Fragment>
      <Box sx={{ marginTop: '4px', marginBottom: '4px' }}>
        <ExpandMore expand={expanded} onClick={toggleExpanded} aria-expanded={expanded} aria-label="grass properties">
          <ExpandMoreIcon />
        </ExpandMore>
        <label>{t('editor:properties.scatter.lbl-grassProperties')}</label>
      </Box>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <RandomizedPropertyInputGroup
          name="Blade Height"
          label={t('editor:properties.grass.bladeHeight')}
          onChange={onChangeProp('bladeHeight')}
          value={props.bladeHeight}
        />
        <RandomizedPropertyInputGroup
          name="Blade Width"
          label={t('editor:properties.grass.bladeWidth')}
          onChange={onChangeProp('bladeWidth')}
          value={props.bladeWidth}
        />
        <NumericInputGroup
          name="Joints"
          label={t('editor:properties.grass.joints')}
          onChange={onChangeProp('joints')}
          value={props.joints}
          min={2}
          max={100}
          smallStep={1}
          mediumStep={2}
          largeStep={5}
        />
        <ImagePreviewInputGroup
          name="Grass Texture"
          label={t('editor:properties.grass.texture')}
          onChange={onChangeGrass}
          value={grass}
        />
        <ImagePreviewInputGroup
          name="Alpha Map"
          label={t('editor:properties.grass.alphaMap')}
          onChange={onChangeAlpha}
          value={alpha}
        />
        <NumericInputGroup
          name="ambientStrength"
          label={t('editor:properties.grass.ambientStrength')}
          onChange={onChangeProp('ambientStrength')}
          value={props.ambientStrength}
          min={0}
          max={1}
          smallStep={0.01}
          mediumStep={0.025}
          largeStep={0.1}
        />
        <NumericInputGroup
          name="translucencyStrength"
          label={t('editor:properties.grass.translucencyStrength')}
          onChange={onChangeProp('translucencyStrength')}
          value={props.translucencyStrength}
          min={0}
          max={1}
          smallStep={0.01}
          mediumStep={0.025}
          largeStep={0.1}
        />
        <NumericInputGroup
          name="diffuseStrength"
          label={t('editor:properties.grass.diffuseStrength')}
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
          label={t('editor:properties.grass.shininess')}
          onChange={onChangeProp('shininess')}
          value={props.shininess}
          min={0}
          max={512}
          smallStep={0.5}
          mediumStep={1}
          largeStep={5}
        />
        <InputGroup name="Sun Colour" label={t('editor:properties.grass.sunColor')}>
          <ColorInput value={props.sunColour} onChange={onChangeProp('sunColour')} />
        </InputGroup>
      </Collapse>
    </Fragment>
  )
}
