// @ts-nocheck
import { Video } from '@styled-icons/fa-solid/Video'
import React from 'react'
import InputGroup from '../inputs/InputGroup'
import AudioSourceProperties from './AudioSourceProperties'
import NodeEditor from './NodeEditor'
import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import SelectInput from '../inputs/SelectInput'
import ArrayInputGroup from '../inputs/ArrayInputGroup'

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

  const onChangePlayMode = (id) => {
    CommandManager.instance.setPropertyOnSelection('playMode', id)
  }

  const onChangePaths = (paths) => {
    CommandManager.instance.setPropertyOnSelection('paths', paths)
  }

  //returning editor view
  return (
    <NodeEditor description={VolumetricNodeEditor.description} {...props}>
      <ArrayInputGroup
        name="UVOL Paths"
        prefix="uvol"
        values={node.paths}
        onChange={onChangePaths}
        label={t('editor:properties.volumetric.uvolPaths')}
      ></ArrayInputGroup>
      <InputGroup name="Play Mode" label={t('editor:properties.volumetric.playmode')}>
        <SelectInput options={node.playModeItems} value={node.playMode} onChange={onChangePlayMode} />
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
