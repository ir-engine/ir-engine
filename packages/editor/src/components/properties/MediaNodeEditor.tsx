import React from 'react'
import { useTranslation } from 'react-i18next'

import { StaticResourceService } from '@etherealengine/client-core/src/media/services/StaticResourceService'
import { AllFileTypes } from '@etherealengine/engine/src/assets/constants/fileTypes'
import {
  AudioFileTypes,
  VideoFileTypes,
  VolumetricFileTypes
} from '@etherealengine/engine/src/assets/constants/fileTypes'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getEntityErrors } from '@etherealengine/engine/src/scene/components/ErrorComponent'
import { MediaComponent } from '@etherealengine/engine/src/scene/components/MediaComponent'
import { PlayMode } from '@etherealengine/engine/src/scene/constants/PlayMode'
import { addError } from '@etherealengine/engine/src/scene/functions/ErrorFunctions'

import { SupportedFileTypes } from '../../constants/AssetTypes'
import ArrayInputGroup from '../inputs/ArrayInputGroup'
import BooleanInput from '../inputs/BooleanInput'
import { Button } from '../inputs/Button'
import CompoundNumericInput from '../inputs/CompoundNumericInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

const PlayModeOptions = [
  {
    label: 'Single',
    value: PlayMode.single
  },
  {
    label: 'Random',
    value: PlayMode.random
  },
  {
    label: 'Loop',
    value: PlayMode.loop
  },
  {
    label: 'SingleLoop',
    value: PlayMode.singleloop
  }
]

export const MediaNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const media = useComponent(props.entity, MediaComponent)
  const errors = getEntityErrors(props.entity, MediaComponent)

  const toggle = () => {
    media.paused.set(!media.paused.value)
  }

  const updateResources = async (e) => {
    const resources = await Promise.all(
      e.map(async (path, index) => {
        const extension = `.${path.split('.').pop()}`
        let existingMedia
        try {
          if (AudioFileTypes.indexOf(extension) > -1) existingMedia = await StaticResourceService.uploadAudio(path)
          else if (VideoFileTypes.indexOf(extension) > -1) existingMedia = await StaticResourceService.uploadVideo(path)
          else if (VolumetricFileTypes.indexOf(extension) > -1)
            existingMedia = await StaticResourceService.uploadVolumetric(path)
          return existingMedia
        } catch (err) {
          addError(props.entity, MediaComponent, 'INVALID_URL', path)
          return {}
        }
      })
    )

    updateProperty(MediaComponent, 'resources')(resources)
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.media.name')}
      description={t('editor:properties.media.description')}
    >
      {errors ? (
        Object.entries(errors).map(([err, message]) => {
          return <div style={{ marginTop: 2, color: '#FF8C00' }}>{'Error: ' + err + '--' + message}</div>
        })
      ) : (
        <></>
      )}
      <InputGroup name="Volume" label={t('editor:properties.media.lbl-volume')}>
        <CompoundNumericInput value={media.volume.value} onChange={updateProperty(MediaComponent, 'volume')} />
      </InputGroup>
      <InputGroup name="Is Music" label={t('editor:properties.media.lbl-isMusic')}>
        <BooleanInput value={media.isMusic.value} onChange={updateProperty(MediaComponent, 'isMusic')} />
      </InputGroup>
      <InputGroup
        name="Controls"
        label={t('editor:properties.media.lbl-controls')}
        info={t('editor:properties.media.info-controls')}
      >
        <BooleanInput value={media.controls.value} onChange={updateProperty(MediaComponent, 'controls')} />
      </InputGroup>
      <InputGroup
        name="Auto Play"
        label={t('editor:properties.media.lbl-paused')}
        info={t('editor:properties.media.info-paused')}
      >
        <BooleanInput value={media.paused.value} onChange={updateProperty(MediaComponent, 'paused')} />
      </InputGroup>
      <InputGroup
        name="Synchronize"
        label={t('editor:properties.media.lbl-synchronize')}
        info={t('editor:properties.media.info-synchronize')}
      >
        <BooleanInput value={media.synchronize.value} onChange={updateProperty(MediaComponent, 'synchronize')} />
      </InputGroup>
      <ArrayInputGroup
        name="Source Paths"
        prefix="Content"
        values={media.resources.value.map(
          (resource) =>
            resource?.mp3StaticResource?.LOD0_url ||
            resource?.mpegStaticResource?.LOD0_url ||
            resource?.oggStaticResource?.LOD0_url ||
            resource?.mp4StaticResource?.LOD0_url ||
            resource?.manifest?.staticResource?.LOD0_url ||
            resource?.uvolStaticResource?.LOD0_url ||
            resource?.drcsStaticResource?.LOD0_url ||
            resource?.path ||
            ''
        )}
        onChange={updateResources}
        label={t('editor:properties.media.paths')}
        acceptFileTypes={AllFileTypes}
        itemType={SupportedFileTypes}
      ></ArrayInputGroup>
      <InputGroup name="Play Mode" label={t('editor:properties.media.playmode')}>
        <SelectInput
          key={props.entity}
          options={PlayModeOptions}
          value={media.playMode.value}
          onChange={updateProperty(MediaComponent, 'playMode')}
        />
        {media.resources && media.resources.length > 0 && media.resources[0] && (
          <Button style={{ marginLeft: '5px', width: '60px' }} type="submit" onClick={toggle}>
            {media.paused ? t('editor:properties.media.playtitle') : t('editor:properties.media.pausetitle')}
          </Button>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

export default MediaNodeEditor
