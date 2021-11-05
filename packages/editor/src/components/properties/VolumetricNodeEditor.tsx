// @ts-nocheck
import { Video } from '@styled-icons/fa-solid/Video'
import React from 'react'
import InputGroup from '../inputs/InputGroup'
import VolumetricInput from '../inputs/VolumetricInput'
import AudioSourceProperties from './AudioSourceProperties'
import NodeEditor from './NodeEditor'
import useSetPropertySelected from './useSetPropertySelected'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'

/**
 * VolumetricNodeEditor provides the editor view to customize properties.
 *
 * @author Robert Long
 * @param       {any} props
 * @constructor
 */
export function VolumetricNodeEditor(props) {
  const { node } = props
  const { t } = useTranslation()

  VolumetricNodeEditor.description = t('editor:properties.volumetric.description')

  //function to handle the change in src property
  const onChangeSrc = useSetPropertySelected('srcUrl')

  //returning editor view
  return (
    <NodeEditor description={VolumetricNodeEditor.description} {...props}>
      <InputGroup name="Volumetric" label={t('editor:properties.volumetric.lbl-volumetric')}>
        <VolumetricInput value={node.srcUrl} onChange={onChangeSrc} />
      </InputGroup>
      <AudioSourceProperties {...props} />
    </NodeEditor>
  )
}

//setting iconComponent with icon name
VolumetricNodeEditor.iconComponent = Video

//setting description and will appear on editor view
VolumetricNodeEditor.description = i18n.t('editor:properties.volumetric.description')
export default VolumetricNodeEditor
