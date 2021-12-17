// @ts-nocheck
import React from 'react'
import InputGroup from '../inputs/InputGroup'
import VideocamIcon from '@mui/icons-material/Videocam'
import AudioSourceProperties from './AudioSourceProperties'
import NodeEditor from './NodeEditor'
import useSetPropertySelected from './Util'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import FolderInput from '../inputs/FolderInput'

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
        <FolderInput value={node.srcUrl} onChange={onChangeSrc} />
      </InputGroup>
      <AudioSourceProperties {...props} />
    </NodeEditor>
  )
}

//setting iconComponent with icon name
VolumetricNodeEditor.iconComponent = VideocamIcon

//setting description and will appear on editor view
VolumetricNodeEditor.description = i18n.t('editor:properties.volumetric.description')
export default VolumetricNodeEditor
