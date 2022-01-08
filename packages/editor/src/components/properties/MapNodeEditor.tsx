import i18n from 'i18next'
import React from 'react'
import { useTranslation } from 'react-i18next'

import MapIcon from '@mui/icons-material/Map'

import { CommandManager } from '../../managers/CommandManager'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import NodeEditor from './NodeEditor'

type MapNodeEditorProps = {
  node?: any
}

/**
 * [BoxColliderNodeEditor is used to provide properties to customize box collider element]
 * @type {[component class]}
 */

export function MapNodeEditor(props: MapNodeEditorProps) {
  const { node } = props
  const { t } = useTranslation()

  const onChangeStartLatitude = (payload) => {
    CommandManager.instance.setPropertyOnSelection('startLatitude', payload)
  }

  const onChangeStartLongitude = (payload) => {
    CommandManager.instance.setPropertyOnSelection('startLongitude', payload)
  }

  const onChangeUseGeolocation = (payload) => {
    CommandManager.instance.setPropertyOnSelection('useDeviceGeolocation', payload)
  }

  const onChangeShowRasterTiles = (payload) => {
    CommandManager.instance.setPropertyOnSelection('showRasterTiles', payload)
  }

  const onToggleDebug = (payload) => {
    CommandManager.instance.setPropertyOnSelection('enableDebug', payload)
  }

  //defining description and shows this description in NodeEditor  with title of elementt,
  // available to add in scene in assets.
  const description = i18n.t('editor:properties.map.description')

  return (
    <NodeEditor {...props} description={description}>
      <InputGroup
        name="Start at device's geolocation?"
        label={t('editor:properties.map.lbl-useDeviceGeolocation')}
        info={t('editor:properties.map.info-useDeviceGeolocation')}
      >
        <BooleanInput value={node.useDeviceGeolocation} onChange={onChangeUseGeolocation} />
      </InputGroup>
      <InputGroup name="Start Latitude" label={t('editor:properties.map.lbl-startLatitude')}>
        <StringInput value={node.startLatitude} onChange={onChangeStartLatitude} />
      </InputGroup>
      <InputGroup name="Start Longitude" label={t('editor:properties.map.lbl-startLongitude')}>
        <StringInput value={node.startLongitude} onChange={onChangeStartLongitude} />
      </InputGroup>
      <InputGroup
        name="Show Raster Tiles?"
        label={t('editor:properties.map.lbl-showRasterTiles')}
        info={t('editor:properties.map.info-showRasterTiles')}
      >
        <BooleanInput value={node.showRasterTiles} onChange={onChangeShowRasterTiles} />
      </InputGroup>
      <InputGroup
        name="Enable debugging code?"
        label={t('editor:properties.map.lbl-enableDebug')}
        info={t('editor:properties.map.info-enableDebug')}
      >
        <BooleanInput value={node.enableDebug} onChange={onToggleDebug} />
      </InputGroup>
    </NodeEditor>
  )
}

MapNodeEditor.iconComponent = MapIcon

export default MapNodeEditor
