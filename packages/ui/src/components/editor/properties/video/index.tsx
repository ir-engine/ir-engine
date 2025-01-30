/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineVideoCamera } from 'react-icons/hi2'

import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import {
  getComponent,
  getMutableComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { MediaComponent, MediaElementComponent, setTime } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'

import { useQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { PlayMode } from '@ir-engine/engine/src/scene/constants/PlayMode'
import { Checkbox } from '@ir-engine/ui'
import { BackSide, ClampToEdgeWrapping, DoubleSide, FrontSide, MirroredRepeatWrapping, RepeatWrapping } from 'three'
import { Slider } from '../../../../../editor'
import Button from '../../../../primitives/tailwind/Button'

import ArrayInputGroup from '../../../editorUpdates/input/Array'
import InputGroup from '../../../editorUpdates/input/Group'
import MediaPreview from '../../../editorUpdates/properties/media/preview'
import SegmentedControlInput from '../../input/SegmentedControl'
import SelectInput from '../../input/Select'
import Vector2Input from '../../input/Vector2'

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

const fitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Vertical', value: 'vertical' },
  { label: 'Horizontal', value: 'horizontal' }
]

const projectionOptions = [
  { label: 'Flat', value: 'Flat' },
  { label: 'Equirectangular360', value: 'Equirectangular360' }
]

const wrappingOptions = [
  { label: 'Repeat', value: RepeatWrapping },
  { label: 'Clamp', value: ClampToEdgeWrapping },
  { label: 'Mirrored Repeat', value: MirroredRepeatWrapping }
]

/**
 * VideoNodeEditor used to render editor view for property customization.
 */
export const VideoNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const video = useComponent(props.entity, VideoComponent)
  const media = useOptionalComponent(props.entity, MediaComponent)

  const mediaUUID = video.mediaUUID.value
  let mediaEntity = props.entity
  if (mediaUUID && mediaUUID != '') {
    mediaEntity = UUIDComponent.getEntityByUUID(mediaUUID)
  }
  const mediaElement = getMutableComponent(mediaEntity, MediaElementComponent)
  const [mediaSourceValue, setMediaSourceValue] = useState('Self')

  const mediaSourceOptions = [
    {
      label: 'This Player',
      value: 'Self'
    },
    {
      label: 'Sync With Other',
      value: 'Other'
    }
  ]

  const mediaEntities = useQuery([MediaComponent])
  const mediaOptions = mediaEntities
    .filter((entity) => entity !== props.entity)
    .map((entity) => {
      return { label: getComponent(entity, NameComponent), value: getComponent(entity, UUIDComponent) }
    })

  const toggle = () => {
    if (media) {
      media.paused.set(!media.paused.value)
    }
  }

  const reset = () => {
    if (mediaElement && media) {
      setTime(mediaElement.element, media.seekTime.value)
    }
  }

  const mediaSourceChange = (val: string) => {
    setMediaSourceValue(val)
    if (val === 'Self') {
      video.mediaUUID.set('' as EntityUUID)
    }
  }

  useEffect(() => {
    if (!hasComponent(props.entity, MediaComponent)) {
      const nodes = SelectionState.getSelectedEntities()
      EditorControlFunctions.addOrRemoveComponent(nodes, MediaComponent, true)
    }
  }, [])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.video.name')}
      description={t('editor:properties.video.description')}
      Icon={VideoNodeEditor.iconComponent}
    >
      {/*<ProgressBar
        value={0}
        paused={false}
        totalTime={0}
      />*/}
      <InputGroup
        name="Media"
        label={t('editor:properties.video.lbl-media')}
        info={t('editor:properties.video.lbl-media-info')}
      >
        <SegmentedControlInput value={mediaSourceValue} onChange={mediaSourceChange} options={mediaSourceOptions} />
      </InputGroup>

      {mediaSourceValue !== 'Self' && (
        <InputGroup
          name="SynchronizedMedia"
          label={t('editor:properties.video.lbl-synchronized-media-source')}
          info={t('editor:properties.video.lbl-synchronized-media-source-info')}
        >
          <SelectInput
            value={video.mediaUUID.value}
            onChange={commitProperty(VideoComponent, 'mediaUUID')}
            options={mediaOptions}
          />
        </InputGroup>
      )}

      {video.mediaUUID.value == '' && media && (
        <>
          <InputGroup
            name="SourcePaths"
            label={t('editor:properties.media.paths')}
            info={t('editor:properties.media.paths')}
          >
            {media.resources.length > 0 && <MediaPreview resources={media.resources} />}
            <ArrayInputGroup
              values={media.resources.value as string[]}
              dropTypes={[...ItemTypes.Videos]}
              onChange={commitProperty(MediaComponent, 'resources')}
            />
          </InputGroup>

          <InputGroup
            name="Volume"
            label={t('editor:properties.media.lbl-volume')}
            info={t('editor:properties.media.lbl-volume')}
          >
            <Slider
              min={0}
              max={100}
              step={1}
              value={media.volume.value}
              onChange={updateProperty(MediaComponent, 'volume')}
              onRelease={commitProperty(MediaComponent, 'volume')}
              aria-label="Volume"
            />
          </InputGroup>

          <InputGroup
            name="MediaOptions"
            label={t('editor:properties.media.lbl-mediaOptions')}
            info={t('editor:properties.media.info-mediaOptions')}
          >
            <Checkbox
              label={t('editor:properties.media.lbl-controls')}
              variantTextPlacement={'right'}
              variantTextClassname={'text-[#B2B5BD]'}
              checked={media.controls.value}
              onChange={commitProperty(MediaComponent, 'controls')}
            />
            <Checkbox
              label={t('editor:properties.media.lbl-mediaSynchronize')}
              variantTextPlacement={'right'}
              variantTextClassname={'text-[#B2B5BD]'}
              checked={media.synchronize.value}
              onChange={commitProperty(MediaComponent, 'synchronize')}
            />
            <Checkbox
              label={t('editor:properties.media.lbl-autoplayRuntime')}
              variantTextPlacement={'right'}
              variantTextClassname={'text-[#B2B5BD]'}
              checked={media.autoplayRuntime.value}
              onChange={commitProperty(MediaComponent, 'autoplayRuntime')}
            />
            <Checkbox
              label={t('editor:properties.media.lbl-autoplayEditor')}
              variantTextPlacement={'right'}
              variantTextClassname={'text-[#B2B5BD]'}
              checked={media.autoplayEditor.value}
              onChange={commitProperty(MediaComponent, 'autoplayEditor')}
            />
            <Checkbox
              label={t('editor:properties.media.lbl-muteEditor')}
              variantTextPlacement={'right'}
              variantTextClassname={'text-[#B2B5BD]'}
              checked={media.muteEditor.value}
              onChange={commitProperty(MediaComponent, 'muteEditor')}
            />
          </InputGroup>

          <InputGroup name="Play Mode" label={t('editor:properties.media.playmode')}>
            <SelectInput
              key={props.entity}
              options={PlayModeOptions}
              value={media.playMode.value}
              onChange={commitProperty(MediaComponent, 'playMode')}
            />
          </InputGroup>

          <InputGroup
            name="Video Fit"
            label={t('editor:properties.video.lbl-fit')}
            info={t('editor:properties.video.lbl-fit-info')}
          >
            <SelectInput
              value={video.fit.value}
              onChange={commitProperty(VideoComponent, 'fit')}
              options={fitOptions}
            />
          </InputGroup>

          <InputGroup name="Projection" label={t('editor:properties.video.lbl-projection')}>
            <SegmentedControlInput
              value={video.projection.value}
              onChange={commitProperty(VideoComponent, 'projection')}
              options={projectionOptions}
            />
          </InputGroup>

          <InputGroup
            name="Side"
            label={t('editor:properties.video.lbl-side')}
            info={t('editor:properties.video.lbl-side-info')}
          >
            <SegmentedControlInput
              value={video.side.value}
              onChange={commitProperty(VideoComponent, 'side')}
              options={[
                { label: 'Front', value: FrontSide },
                { label: 'Back', value: BackSide },
                { label: 'Double', value: DoubleSide }
              ]}
            />
          </InputGroup>

          <InputGroup
            name="Video Size"
            label={t('editor:properties.video.lbl-size')}
            info={t('editor:properties.video.lbl-size-info')}
          >
            <Vector2Input
              value={video.size.value}
              onChange={updateProperty(VideoComponent, 'size')}
              onRelease={commitProperty(VideoComponent, 'size')}
            />
          </InputGroup>

          <InputGroup
            name="UV Offset"
            label={t('editor:properties.video.lbl-uv-offset')}
            info={t('editor:properties.video.lbl-uv-offset-info')}
          >
            <Vector2Input
              value={video.uvOffset.value}
              onChange={updateProperty(VideoComponent, 'uvOffset')}
              onRelease={commitProperty(VideoComponent, 'uvOffset')}
            />
          </InputGroup>

          <InputGroup
            name="UV Scale"
            label={t('editor:properties.video.lbl-uv-scale')}
            info={t('editor:properties.video.lbl-uv-scale-info')}
          >
            <Vector2Input
              value={video.uvScale.value}
              onChange={updateProperty(VideoComponent, 'uvScale')}
              onRelease={commitProperty(VideoComponent, 'uvScale')}
            />
          </InputGroup>
          <InputGroup
            name="Wrap"
            label={t('editor:properties.video.lbl-wrap')}
            info={t('editor:properties.video.lbl-wrap-info')}
          >
            <div className="flex w-full">
              <div className="flex w-1/2">
                <SelectInput
                  labelProps={{
                    text: t('editor:properties.video.lbl-wrap-s'),
                    position: 'inside',
                    className: 'text-red-500'
                  }}
                  value={video.wrapS.value}
                  onChange={commitProperty(VideoComponent, 'wrapS')}
                  options={wrappingOptions}
                />
              </div>
              <div className="flex w-1/2">
                <SelectInput
                  labelProps={{
                    text: t('editor:properties.video.lbl-wrap-t'),
                    position: 'inside',
                    className: 'text-green-400'
                  }}
                  value={video.wrapT.value}
                  onChange={commitProperty(VideoComponent, 'wrapT')}
                  options={wrappingOptions}
                />
              </div>
            </div>
          </InputGroup>

          {mediaElement && media.resources.length > 0 && (
            <InputGroup
              name="media-controls"
              info={t('editor:properties.media.info-mediaControls')}
              label={t('editor:properties.media.lbl-mediaControls')}
              className="mb-2 flex gap-2"
            >
              <Button variant="tertiary" onClick={toggle}>
                {media.paused.value ? t('editor:properties.media.playtitle') : t('editor:properties.media.pausetitle')}
              </Button>
              <Button variant="tertiary" onClick={reset}>
                {t('editor:properties.media.resettitle')}
              </Button>
            </InputGroup>
          )}
        </>
      )}

      <InputGroup
        name="Use Alpha"
        label={t('editor:properties.video.lbl-use-alpha')}
        info={t('editor:properties.video.lbl-use-alpha-info')}
      >
        <Checkbox
          label={t('editor:properties.video.lbl-use-alphaEnable')}
          variantTextPlacement={'right'}
          variantTextClassname={'text-[#B2B5BD]'}
          checked={video.useAlpha.value}
          onChange={commitProperty(VideoComponent, 'useAlpha')}
        />

        {video.useAlpha.value && (
          <>
            <Checkbox
              label={t('editor:properties.video.lbl-use-alphaInvert')}
              variantTextPlacement={'right'}
              variantTextClassname={'text-[#B2B5BD]'}
              checked={video.useAlphaInvert.value}
              onChange={commitProperty(VideoComponent, 'useAlphaInvert')}
            />

            <Slider
              label={t('editor:properties.video.lbl-alpha-threshold')}
              min={0}
              max={1}
              step={0.01}
              value={video.alphaThreshold.value}
              onChange={updateProperty(VideoComponent, 'alphaThreshold')}
              onRelease={commitProperty(VideoComponent, 'alphaThreshold')}
              aria-label="alphaThreshold"
            />

            <Checkbox
              label={t('editor:properties.video.lbl-use-alpha-uv-transform')}
              variantTextPlacement={'right'}
              variantTextClassname={'text-[#B2B5BD]'}
              checked={video.useAlphaUVTransform.value}
              onChange={commitProperty(VideoComponent, 'useAlphaUVTransform')}
            />

            {video.useAlphaUVTransform.value && (
              <Vector2Input
                value={video.alphaUVOffset.value}
                onChange={updateProperty(VideoComponent, 'alphaUVOffset')}
                onRelease={commitProperty(VideoComponent, 'alphaUVOffset')}
                labelXOverride={'U'}
                labelYOverride={'V'}
              />
            )}
          </>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

VideoNodeEditor.iconComponent = HiOutlineVideoCamera

export default VideoNodeEditor
