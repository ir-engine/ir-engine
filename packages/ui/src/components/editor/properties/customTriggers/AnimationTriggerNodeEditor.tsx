/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import PanToolIcon from '@mui/icons-material/PanTool'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { defineQuery, useQuery } from '@etherealengine/ecs/src/QueryFunctions'
import { CallbackComponent } from '@etherealengine/spatial/src/common/CallbackComponent'

import { UUIDComponent, getComponent, getOptionalComponent, useComponent } from '@etherealengine/ecs'
import InputGroup from '@etherealengine/editor/src/components/inputs/InputGroup'
import SelectInput from '@etherealengine/editor/src/components/inputs/SelectInput'
import { NodeEditor } from '@etherealengine/editor/src/components/properties/NodeEditor'
import { EditorComponentType, commitProperty } from '@etherealengine/editor/src/components/properties/Util'
import { AnimationTriggerComponent } from '@etherealengine/engine/src/AnimationTriggerComponent'
import { AnimationComponent } from '@etherealengine/engine/src/avatar/components/AnimationComponent'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { useState } from '@etherealengine/hyperflux'
import { NameComponent } from '@etherealengine/spatial/src/common/NameComponent'

export enum LoopType {
  LoopOnce,
  LoopRepeat,
  LoopPingPong
}

const LoopTypeOptions = [
  { label: 'Loop Once', value: LoopType.LoopOnce },
  { label: 'Loop Repeat', value: LoopType.LoopRepeat },
  { label: 'Loop Ping Pong', value: LoopType.LoopPingPong }
]

const callbackQuery = defineQuery([CallbackComponent])

export const AnimationTriggerNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()

  const component = useComponent(props.entity, AnimationTriggerComponent)

  const animationOptions = useState([] as { label: string; value: number }[])

  const availableAnimations = useQuery([LoopAnimationComponent]).map((entity) => {
    const name = getComponent(entity, NameComponent)
    const uuid = getComponent(entity, UUIDComponent)
    return {
      label: name,
      value: uuid
    }
  })

  useEffect(() => {}, [])

  useEffect(() => {
    animationOptions.set([{ label: 'None', value: -1 }])
    if (!component.animationEntityUUID.value) {
      return
    }
    const animationEntity = UUIDComponent.getEntityByUUID(component.animationEntityUUID.value)
    const animationComponent = getOptionalComponent(animationEntity, AnimationComponent)
    if (!animationComponent || !animationComponent.animations.length) return
    animationOptions.merge([
      ...animationComponent.animations.map((clip, index) => ({ label: clip.name, value: index }))
    ])
  }, [component.animationEntityUUID])

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.animationTrigger.name')}
      description={t('editor:properties.animationTrigger.description')}
    >
      <InputGroup name="AnimationEntity" label={t('editor:properties.animationTrigger.lbl-animation')}>
        <SelectInput
          options={availableAnimations}
          value={component.animationEntityUUID.value!}
          onChange={commitProperty(AnimationTriggerComponent, 'animationEntityUUID') as any}
        />
      </InputGroup>
      <InputGroup name="Enter Animation" label={t('editor:properties.animationTrigger.lbl-enterAnimation')}>
        <SelectInput
          options={animationOptions.value as { label: string; value: number }[]}
          value={component.value.enterClipIndex}
          onChange={commitProperty(AnimationTriggerComponent, 'enterClipIndex') as any}
        />
      </InputGroup>
      <InputGroup name="Enter Loop Type" label={t('editor:properties.animationTrigger.lbl-enterLoop')}>
        <SelectInput
          options={LoopTypeOptions}
          onChange={commitProperty(AnimationTriggerComponent, `enterLoopType` as any)}
          value={component.value.enterLoopType}
        />
      </InputGroup>
      <InputGroup name="Exit Animation" label={t('editor:properties.animationTrigger.lbl-exitAnimation')}>
        <SelectInput
          options={animationOptions.value as { label: string; value: number }[]}
          value={component.value.exitClipIndex}
          onChange={commitProperty(AnimationTriggerComponent, 'exitClipIndex') as any}
        />
      </InputGroup>
      <InputGroup name="Exit Loop Type" label={t('editor:properties.animationTrigger.lbl-exitLoop')}>
        <SelectInput
          options={LoopTypeOptions}
          onChange={commitProperty(AnimationTriggerComponent, `exitLoopType` as any)}
          value={component.value.exitLoopType}
        />
      </InputGroup>
    </NodeEditor>
  )
}

AnimationTriggerNodeEditor.iconComponent = PanToolIcon

export default AnimationTriggerNodeEditor
