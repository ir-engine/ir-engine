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

import React from 'react'

import multiLogger from '@ir-engine/common/src/logger'
import { useMutableState } from '@ir-engine/hyperflux'
import { RendererState } from '@ir-engine/spatial/src/renderer/RendererState'
import Divider from '@ir-engine/ui/src/components/viewer/Divider'
import { Dropdown } from '@ir-engine/ui/viewer'
import { clientContextParams } from '../../util/ClientContextState'
import { NavigateFuncProps } from '../Glass/NavigationProvider'
import { Inner } from '../Glass/ToolbarAndSidebar'
import { Section } from './Section'
import SliderItem from './SliderItem'
import ToggleItem from './ToggleItem'

const logger = multiLogger.child({ component: 'system:settings-menu', modifier: clientContextParams })

// Define types for screen components
type ScreenProps = NavigateFuncProps & {}

const GraphicsSettings: React.FC<ScreenProps> = ({ navigateTo }) => {
  const { qualityLevel, usePostProcessing, useShadows, automatic, shadowMapResolution } = useMutableState(RendererState)

  const onQualityChange = (value: number) => {
    qualityLevel.set(value)
    logger.analytics({ event_name: 'set_quality_preset', event_value: value })
    automatic.set(false)
    logger.analytics({ event_name: 'automatic_qp', event_value: false })
  }
  const onPostProcessingToggle = () => {
    usePostProcessing.set(!usePostProcessing.value)
    logger.analytics({ event_name: 'post_processing', event_value: usePostProcessing.value })
    automatic.set(false)
    logger.analytics({ event_name: 'automatic_qp', event_value: false })
  }
  const onShadowToggle = () => {
    useShadows.set(!useShadows.value)
    logger.analytics({ event_name: 'shadows', event_value: useShadows.value })
    automatic.set(false)
    logger.analytics({ event_name: 'automatic_qp', event_value: false })
  }

  const onShadowMapResolutionChange = (event) => {
    shadowMapResolution.set(Number(event))
    logger.info({
      event_name: 'change_shadow_map_resolution',
      event_value: `${event}px`
    })
    automatic.set(false)
    logger.analytics({ event_name: 'automatic_qp', event_value: false })
  }

  return (
    <Inner className="space-y-4">
      <Section>
        <SliderItem
          label="Quality Preset"
          min={0}
          step={1}
          max={5}
          value={qualityLevel.value}
          defaultValue={qualityLevel.value}
          onChange={onQualityChange}
        />
        <Divider />
        <ToggleItem label="Post Processing" checked={usePostProcessing.value} onClick={onPostProcessingToggle} />
        <Divider />
        <ToggleItem label="Shadows" checked={useShadows.value} onClick={onShadowToggle} />
        <Divider />
        <Dropdown
          onChange={onShadowMapResolutionChange}
          value={shadowMapResolution.value}
          options={[
            { label: '256px', value: 256 },
            { label: '512px', value: 512 },
            { label: '1024px', value: 1024 },
            { label: '2048px', value: 2048 },
            { label: '4096px (not recommended)', value: 4096 }
          ]}
        />
      </Section>
    </Inner>
  )
}

export default GraphicsSettings
