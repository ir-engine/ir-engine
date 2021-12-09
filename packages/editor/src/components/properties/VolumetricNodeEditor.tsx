// @ts-nocheck
import VideocamIcon from '@mui/icons-material/Videocam'
import React from 'react'
import InputGroup from '../inputs/InputGroup'
import { Button } from '../inputs/Button'
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
        {node.paths && node.paths.length > 0 && node.paths[0] && (
          <Button
            style={{ marginLeft: '5px', width: '60px' }}
            type="submit"
            onClick={() => {
              node.onPlay()
            }}
          >
            {node.isUVOLPlay
              ? t('editor:properties.volumetric.pausetitle')
              : t('editor:properties.volumetric.playtitle')}
          </Button>
        )}
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
