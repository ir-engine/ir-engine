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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiOutlineVideoCamera } from 'react-icons/hi2'

import { EntityUUID, UUIDComponent } from '@ir-engine/ecs'
import { getComponent, hasComponent, useComponent, useOptionalComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { MediaComponent, MediaElementComponent } from '@ir-engine/engine/src/scene/components/MediaComponent'
import { VideoComponent } from '@ir-engine/engine/src/scene/components/VideoComponent'
import { NameComponent } from '@ir-engine/spatial/src/common/NameComponent'

import { useQuery } from '@ir-engine/ecs/src/QueryFunctions'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { EditorControlFunctions } from '@ir-engine/editor/src/functions/EditorControlFunctions'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { SelectionState } from '@ir-engine/editor/src/services/SelectionServices'
import { Checkbox } from '@ir-engine/ui'
import { BackSide, ClampToEdgeWrapping, DoubleSide, FrontSide, MirroredRepeatWrapping, RepeatWrapping } from 'three'
import InputGroup from '../../input/Group'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'
import Vector2Input from '../../input/Vector2'

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
  const mediaUUID = video.mediaUUID.value
  const mediaEntity = UUIDComponent.getEntityByUUID(mediaUUID)
  const mediaElement = useOptionalComponent(mediaEntity, MediaElementComponent)
  const mediaEntities = useQuery([MediaComponent])
  const mediaOptions = mediaEntities
    .filter((entity) => entity !== props.entity)
    .map((entity) => {
      return { label: getComponent(entity, NameComponent), value: getComponent(entity, UUIDComponent) }
    })
  mediaOptions.unshift({ label: 'Self', value: '' as EntityUUID })

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
        <SelectInput
          value={video.mediaUUID.value}
          onChange={commitProperty(VideoComponent, 'mediaUUID')}
          options={mediaOptions}
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
        name="Side"
        label={t('editor:properties.video.lbl-side')}
        info={t('editor:properties.video.lbl-side-info')}
      >
        <SelectInput
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
        name="Wrap S"
        label={t('editor:properties.video.lbl-wrap-s')}
        info={t('editor:properties.video.lbl-wrap-s-info')}
      >
        <SelectInput
          value={video.wrapS.value}
          onChange={commitProperty(VideoComponent, 'wrapS')}
          options={wrappingOptions}
        />
      </InputGroup>

      <InputGroup
        name="Wrap T"
        label={t('editor:properties.video.lbl-wrap-t')}
        info={t('editor:properties.video.lbl-wrap-t-info')}
      >
        <SelectInput
          value={video.wrapT.value}
          onChange={commitProperty(VideoComponent, 'wrapT')}
          options={wrappingOptions}
        />
      </InputGroup>

      <InputGroup
        name="Use Alpha"
        label={t('editor:properties.video.lbl-use-alpha')}
        info={t('editor:properties.video.lbl-use-alpha-info')}
      >
        <Checkbox checked={video.useAlpha.value} onChange={commitProperty(VideoComponent, 'useAlpha')} />
      </InputGroup>

      {video.useAlpha.value && (
        <>
          <InputGroup
            name="Alpha Threshold"
            label={t('editor:properties.video.lbl-alpha-threshold')}
            info={t('editor:properties.video.lbl-alpha-threshold-info')}
          >
            <NumericInput
              value={video.alphaThreshold.value}
              onChange={updateProperty(VideoComponent, 'alphaThreshold')}
              onRelease={commitProperty(VideoComponent, 'alphaThreshold')}
            />
          </InputGroup>

          <InputGroup
            name="Use Alpha UV Transform"
            label={t('editor:properties.video.lbl-use-alpha-uv-transform')}
            info={t('editor:properties.video.lbl-use-alpha-uv-transform-info')}
          >
            <Checkbox
              checked={video.useAlphaUVTransform.value}
              onChange={commitProperty(VideoComponent, 'useAlphaUVTransform')}
            />
          </InputGroup>

          {video.useAlphaUVTransform.value && (
            <>
              <InputGroup
                name="Alpha UV Offset"
                label={t('editor:properties.video.lbl-alpha-uv-offset')}
                info={t('editor:properties.video.lbl-alpha-uv-offset-info')}
              >
                <Vector2Input
                  value={video.alphaUVOffset.value}
                  onChange={updateProperty(VideoComponent, 'alphaUVOffset')}
                  onRelease={commitProperty(VideoComponent, 'alphaUVOffset')}
                />
              </InputGroup>

              <InputGroup
                name="Alpha UV Scale"
                label={t('editor:properties.video.lbl-alpha-uv-scale')}
                info={t('editor:properties.video.lbl-alpha-uv-scale-info')}
              >
                <Vector2Input
                  value={video.alphaUVScale.value}
                  onChange={updateProperty(VideoComponent, 'alphaUVScale')}
                  onRelease={commitProperty(VideoComponent, 'alphaUVScale')}
                />
              </InputGroup>
            </>
          )}
        </>
      )}

      <InputGroup name="Projection" label={t('editor:properties.video.lbl-projection')}>
        <SelectInput
          value={video.projection.value}
          onChange={commitProperty(VideoComponent, 'projection')}
          options={projectionOptions}
        />
      </InputGroup>

      <InputGroup
        name="Video Fit"
        label={t('editor:properties.video.lbl-fit')}
        info={t('editor:properties.video.lbl-fit-info')}
      >
        <SelectInput value={video.fit.value} onChange={commitProperty(VideoComponent, 'fit')} options={fitOptions} />
      </InputGroup>
    </NodeEditor>
  )
}

VideoNodeEditor.iconComponent = HiOutlineVideoCamera

export default VideoNodeEditor
