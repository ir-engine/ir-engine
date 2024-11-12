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

import {
  getOptionalMutableComponent,
  hasComponent,
  useComponent,
  useOptionalComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { LegacyVolumetricComponent } from '@ir-engine/engine/src/scene/components/LegacyVolumetricComponent'
import { PlayMode } from '@ir-engine/engine/src/scene/constants/PlayMode'

import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { EditorComponentType, commitProperty, updateProperty } from '@ir-engine/editor/src/components/properties/Util'
import { UVOL1Component } from '@ir-engine/engine/src/scene/components/UVOL1Component'
import { UVOL2Component } from '@ir-engine/engine/src/scene/components/UVOL2Component'
import { TextureType } from '@ir-engine/engine/src/scene/constants/UVOLTypes'
import { getState } from '@ir-engine/hyperflux'
import { Checkbox } from '@ir-engine/ui'
import { MdVideocam } from 'react-icons/md'

import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { Slider } from '@ir-engine/ui/editor'
import { Button } from '@mui/material'
import { Scrubber } from 'react-scrubber'
import 'react-scrubber/lib/scrubber.css'
import ArrayInputGroup from '../../../input/Array'
import InputGroup from '../../../input/Group'
import SelectInput from '../../../input/Select'

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

type TextureTargetLabelsType = {
  [key in TextureType]: {
    label: string
    value: number
  }[]
}

/**
 * VolumetricNodeEditor provides the editor view to customize properties.
 *
 * @param       {any} props
 * @constructor
 */
export const LegacyVolumetricNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const volumetricComponent = useComponent(props.entity, LegacyVolumetricComponent)

  const toggle = () => {
    volumetricComponent.paused.set(!volumetricComponent.paused.value)
  }

  const [trackLabels, setTrackLabels] = React.useState(
    [] as {
      label: string
      value: number
    }[]
  )

  useEffect(() => {
    const tracks = volumetricComponent.paths.value
    if (tracks.length === 0) {
      return
    }
    if (tracks.length === 1) {
      const segments = tracks[0].split('/')
      setTrackLabels([
        {
          label: segments[segments.length - 1],
          value: 0
        }
      ])
      console.log('Setting labels: ', [
        {
          label: segments[segments.length - 1],
          value: 0
        }
      ])
      return
    }

    let prefix = tracks[0]

    // Don't show the longest common prefix
    for (let j = 1; j < tracks.length; j++) {
      while (tracks[j].indexOf(prefix) !== 0) {
        prefix = prefix.substring(0, prefix.length - 1)
      }
    }
    const _trackLabels = [] as {
      label: string
      value: number
    }[]

    for (let i = 0; i < tracks.length; i++) {
      _trackLabels.push({
        label: tracks[i].slice(prefix.length),
        value: i
      })
    }
    setTrackLabels(_trackLabels)
    console.log('Setting labels: ', _trackLabels)
  }, [volumetricComponent.paths])

  const uvol2 = useOptionalComponent(props.entity, UVOL2Component)
  const [geometryTargets, setGeometryTargets] = React.useState(
    [] as {
      label: string
      value: number
    }[]
  )

  useEffect(() => {
    if (uvol2) {
      const _geometryTargets = [] as {
        label: string
        value: number
      }[]
      _geometryTargets.push({
        label: 'auto',
        value: -1
      })
      uvol2.geometryInfo.targets.value.forEach((target, index) => {
        _geometryTargets.push({
          label: target,
          value: index
        })
      })
      setGeometryTargets(_geometryTargets)
    }
  }, [uvol2?.geometryInfo.targets])

  const [textureTargets, setTextureTargets] = React.useState({} as TextureTargetLabelsType)
  useEffect(() => {
    if (!uvol2) {
      return
    }
    const textureTypes = uvol2.textureInfo.textureTypes.value
    const _textureTargets = {} as TextureTargetLabelsType
    textureTypes.forEach((textureType) => {
      _textureTargets[textureType] = [] as {
        label: string
        value: number
      }[]
      _textureTargets[textureType].push({
        label: 'auto',
        value: -1
      })
      uvol2.textureInfo[textureType].targets.value.forEach((target, index) => {
        _textureTargets[textureType].push({
          label: target,
          value: index
        })
      })
    })
    setTextureTargets(_textureTargets)
  }, [
    uvol2?.textureInfo.textureTypes,
    uvol2?.textureInfo.baseColor.targets,
    uvol2?.textureInfo.normal.targets,
    uvol2?.textureInfo.emissive.targets,
    uvol2?.textureInfo.metallicRoughness.targets,
    uvol2?.textureInfo.occlusion.targets
  ])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.volumetric.name')}
      description={t('editor:properties.volumetric.description')}
      Icon={LegacyVolumetricNodeEditor.iconComponent}
    >
      <InputGroup name="useLoadingEffect" label={t('editor:properties.volumetric.lbl-useLoadingEffect')}>
        <Checkbox
          onChange={commitProperty(LegacyVolumetricComponent, 'useLoadingEffect')}
          checked={volumetricComponent.useLoadingEffect.value}
        />
      </InputGroup>

      <InputGroup
        name="Autoplay"
        label={t('editor:properties.media.lbl-autoplay')}
        info={t('editor:properties.media.info-autoplay')}
      >
        <Checkbox
          onChange={commitProperty(LegacyVolumetricComponent, 'autoplay')}
          checked={volumetricComponent.autoplay.value}
        />
      </InputGroup>

      <div className="w-auto">
        <Slider
          min={0}
          max={1}
          step={0.01}
          value={volumetricComponent.volume.value}
          onChange={updateProperty(LegacyVolumetricComponent, 'volume')}
          onRelease={commitProperty(LegacyVolumetricComponent, 'volume')}
          aria-label="Volume"
          label={t('editor:properties.media.lbl-volume')}
        />
      </div>

      <ArrayInputGroup
        name="Source Paths"
        //prefix="Content"
        values={volumetricComponent.paths.value as string[]}
        //onRelease={commitProperty(LegacyVolumetricComponent, 'paths')}
        label={t('editor:properties.media.paths')}
        onChange={updateProperty(LegacyVolumetricComponent, 'paths')}
        //acceptFileTypes={VolumetricFileTypes}
        //acceptDropItems={ItemTypes.Volumetrics}
      />

      {(hasComponent(props.entity, UVOL2Component) || hasComponent(props.entity, UVOL1Component)) && (
        <VolumetricCurrentTimeScrubber entity={props.entity} />
      )}

      <div className="w-auto">
        <Slider
          value={volumetricComponent.currentTrackInfo.playbackRate.value}
          min={0.5}
          max={4}
          step={0.1}
          onChange={(value: number) => {
            volumetricComponent.currentTrackInfo.playbackRate.set(value)
          }}
          onRelease={() => {}}
          aria-label="Playback Rate"
          label="Playback Rate"
        />
      </div>

      <InputGroup name="Play Mode" label={t('editor:properties.media.playmode')}>
        <SelectInput
          key={props.entity}
          options={PlayModeOptions}
          value={volumetricComponent.playMode.value}
          onChange={commitProperty(LegacyVolumetricComponent, 'playMode')}
        />
        {volumetricComponent.paths && volumetricComponent.paths.length > 0 && volumetricComponent.paths[0] && (
          <Button style={{ marginLeft: '5px', width: '60px' }} type="submit" onClick={toggle}>
            {volumetricComponent.paused.value
              ? t('editor:properties.media.playtitle')
              : t('editor:properties.media.pausetitle')}
          </Button>
        )}
      </InputGroup>

      {hasComponent(props.entity, UVOL2Component) && (
        <>
          <InputGroup name="Geometry Target" label="Geometry Target">
            <SelectInput
              key={props.entity}
              options={geometryTargets}
              value={uvol2?.geometryInfo.userTarget.value}
              onChange={(value: number) => {
                if (uvol2) {
                  uvol2.geometryInfo.userTarget.set(value)
                }
              }}
            />
          </InputGroup>
          {Object.keys(textureTargets).map((textureType, index) => {
            return (
              <InputGroup name={`${textureType} target`} label={`${textureType} target`} key={index}>
                <SelectInput
                  key={props.entity}
                  options={textureTargets[textureType]}
                  value={uvol2?.textureInfo[textureType].userTarget.value}
                  onChange={(value: number) => {
                    if (uvol2) {
                      uvol2?.textureInfo[textureType].userTarget.set(value)
                    }
                  }}
                />
              </InputGroup>
            )
          })}
        </>
      )}

      <InputGroup name="Current Track" label="Current Track">
        <SelectInput
          key={props.entity}
          options={trackLabels}
          value={trackLabels.length ? volumetricComponent.track.value : ''}
          onChange={(value: number) => {
            volumetricComponent.track.set(value)
          }}
        />
      </InputGroup>
    </NodeEditor>
  )
}

function VolumetricCurrentTimeScrubber(props: { entity: Entity }) {
  const { t } = useTranslation()
  const volumetricComponent = useComponent(props.entity, LegacyVolumetricComponent)
  const uvol2Component = useOptionalComponent(props.entity, UVOL2Component)

  const [isChanging, setIsChanging] = React.useState(false)

  return (
    <InputGroup name="CurrentTime" label={t('editor:properties.media.lbl-currentTime')}>
      <Scrubber
        min={0}
        max={volumetricComponent.currentTrackInfo.duration.value}
        value={volumetricComponent.currentTrackInfo.currentTime.value}
        onScrubStart={() => {
          setIsChanging(true)
        }}
        onScrubEnd={(value) => {
          if (!isChanging) return
          const uvol2Component = getOptionalMutableComponent(props.entity, UVOL2Component)
          if (
            uvol2Component &&
            volumetricComponent.currentTrackInfo.currentTime.value < value &&
            value < uvol2Component.bufferedUntil.value
          ) {
            const engineState = getState(ECSState)
            UVOL2Component.setStartAndPlaybackTime(props.entity, value, engineState.elapsedSeconds)
          }
          setIsChanging(false)
        }}
        onScrubChange={() => {}}
        tooltip={{
          enabledOnHover: true
        }}
        {...(hasComponent(props.entity, UVOL2Component)
          ? {
              bufferPosition: uvol2Component?.bufferedUntil.value
            }
          : {})}
      />
    </InputGroup>
  )
}

//setting iconComponent with icon name
LegacyVolumetricNodeEditor.iconComponent = MdVideocam

export default LegacyVolumetricNodeEditor
