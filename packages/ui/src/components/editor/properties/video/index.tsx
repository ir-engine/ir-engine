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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import {
  getComponent,
  getOptionalMutableComponent,
  getSimulationCounterpart,
  hasComponent,
  useComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { MediaComponent, MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineVideoCamera } from 'react-icons/hi2'

import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { ItemTypes } from '@ir-engine/editor/src/constants/AssetTypes'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { PlayMode } from '@ir-engine/engine/src/scene/constants/PlayMode'
import {
  BackSide,
  ClampToEdgeWrapping,
  DoubleSide,
  FrontSide,
  MirroredRepeatWrapping,
  RepeatWrapping,
  Vector3
} from 'three'

import { TransformComponent } from '@ir-engine/spatial'
import { twMerge } from 'tailwind-merge'
import Checkbox from '../../../../primitives/tailwind/Checkbox'
import InputGroup from '../../input/Group'
import SegmentedControlInput from '../../input/SegmentedControl'
import SelectInput from '../../input/Select'
import Vector2Input from '../../input/Vector2'
import Slider from '../../Slider'
import { MediaInput, MediaMode } from '../media'

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

const audioModeOptions = [
  { label: 'Positional', value: 'positional' },
  { label: 'Ambient', value: 'ambient' }
]

const fitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Stretch', value: 'stretch' },
  { label: 'Horizontal', value: 'horizontal' },
  { label: 'Vertical', value: 'vertical' }
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

  const simulationEntity = getSimulationCounterpart(props.entity)
  const video = useComponent(simulationEntity, VideoComponent)
  const mediaElement = getOptionalMutableComponent(simulationEntity, MediaElementComponent)

  const resizeVideoToMatchAspectRatio = () => {
    const transformComponent = getComponent(props.entity, TransformComponent)
    const videoSize = video.currentVideoSize.value
    const videoRatio = videoSize.x / videoSize.y
    const scale = transformComponent.scale
    const newX = scale.y * videoRatio
    const newY = scale.y
    const newZ = 1
    const newScale = new Vector3(newX, newY, newZ)
    commitProperty(TransformComponent, 'scale')(newScale)
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
      <MediaInput
        mediaMode={MediaMode.video}
        entity={props.entity}
        mediaNodeId={video.mediaUUID.value}
        OnMediaSourceUpdate={commitProperty(VideoComponent, 'mediaUUID')}
        dropTypes={[...ItemTypes.Videos]}
      />

      <InputGroup name="Aspect Ratio" label={t('editor:properties.video.lbl-aspect-ratio')}>
        <button
          className={twMerge(
            'w-full flex-auto rounded-md  px-10 py-1 ',
            mediaElement ? ' bg-surface-1 text-text-primary' : 'bg-surface-2 text-text-inactive'
          )}
          onClick={resizeVideoToMatchAspectRatio}
          disabled={!mediaElement}
        >
          {t('editor:properties.video.lbl-match-aspect-ratio')}
        </button>
      </InputGroup>

      <InputGroup
        name="Video Fit"
        label={t('editor:properties.video.lbl-fit')}
        info={t('editor:properties.video.lbl-fit-info')}
      >
        <SelectInput value={video.fit.value} onChange={commitProperty(VideoComponent, 'fit')} options={fitOptions} />
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
        name="UV Offset"
        label={t('editor:properties.video.lbl-uv-offset')}
        info={t('editor:properties.video.lbl-uv-offset-info')}
      >
        <Vector2Input
          value={video.uvOffset.value}
          onChange={updateProperty(VideoComponent, 'uvOffset')}
          onRelease={commitProperty(VideoComponent, 'uvOffset')}
          axisClassNames={['w-1/2', 'w-1/2']}
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
          axisClassNames={['w-1/2', 'w-1/2']}
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
              value={video.wrapS.value}
              onChange={commitProperty(VideoComponent, 'wrapS')}
              options={wrappingOptions}
            />
          </div>
          <div className="flex w-1/2">
            <SelectInput
              value={video.wrapT.value}
              onChange={commitProperty(VideoComponent, 'wrapT')}
              options={wrappingOptions}
            />
          </div>
        </div>
      </InputGroup>
      <InputGroup
        name="Use Alpha"
        label={t('editor:properties.video.lbl-use-alpha')}
        info={t('editor:properties.video.lbl-use-alpha-info')}
      >
        <Checkbox
          label={t('editor:properties.video.lbl-use-alphaEnable')}
          variantTextPlacement={'right'}
          checked={video.useAlpha.value}
          onChange={commitProperty(VideoComponent, 'useAlpha')}
        />

        {video.useAlpha.value && (
          <>
            <Checkbox
              label={t('editor:properties.video.lbl-use-alphaInvert')}
              variantTextPlacement={'right'}
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

            <InputGroup
              label={t('editor:properties.video.lbl-use-alpha-uv-transform')}
              info={t('editor:properties.video.lbl-use-alpha-uv-transform-info')}
            >
              <Vector2Input
                value={video.alphaUVOffset.value}
                onChange={updateProperty(VideoComponent, 'alphaUVOffset')}
                onRelease={commitProperty(VideoComponent, 'alphaUVOffset')}
                axisLabels={['U', 'V']}
                axisClassNames={['w-1/2', 'w-1/2']}
              />
            </InputGroup>
          </>
        )}
      </InputGroup>
    </NodeEditor>
  )
}

VideoNodeEditor.iconComponent = HiOutlineVideoCamera

export default VideoNodeEditor
