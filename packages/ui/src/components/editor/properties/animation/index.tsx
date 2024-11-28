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

import { getOptionalComponent, useComponent, useOptionalComponent } from '@ir-engine/ecs'
import {
  EditorComponentType,
  commitProperties,
  commitProperty,
  updateProperty
} from '@ir-engine/editor/src/components/properties/Util'
import NodeEditor from '@ir-engine/editor/src/panels/properties/common/NodeEditor'
import { getHips } from '@ir-engine/engine/src/avatar/AvatarBoneMatching'
import { AnimationComponent } from '@ir-engine/engine/src/avatar/components/AnimationComponent'
import { AvatarRigComponent } from '@ir-engine/engine/src/avatar/components/AvatarAnimationComponent'
import { LoopAnimationComponent } from '@ir-engine/engine/src/avatar/components/LoopAnimationComponent'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { getEntityErrors } from '@ir-engine/engine/src/scene/components/ErrorComponent'
import { useState } from '@ir-engine/hyperflux'
import { getCallback } from '@ir-engine/spatial/src/common/CallbackComponent'
import { Checkbox } from '@ir-engine/ui'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FaStreetView } from 'react-icons/fa'
import { LoopOnce, LoopPingPong, LoopRepeat } from 'three'
import { OptionType } from '../../../../primitives/tailwind/Select'
import InputGroup from '../../input/Group'
import ModelInput from '../../input/Model'
import NumericInput from '../../input/Numeric'
import SelectInput from '../../input/Select'

export const LoopAnimationNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity

  const animationOptions = useState([] as { label: string; value: number }[])
  const loopAnimationComponent = useComponent(entity, LoopAnimationComponent)

  const gltfComponent = useOptionalComponent(entity, GLTFComponent)
  const avatarRigComponent = useOptionalComponent(entity, AvatarRigComponent)
  const animationComponent = useOptionalComponent(entity, AnimationComponent)

  const errors = getEntityErrors(props.entity, GLTFComponent)

  const canConvert = getHips(entity)

  useEffect(() => {
    const animationComponent = getOptionalComponent(entity, AnimationComponent)
    if (!animationComponent || !animationComponent.animations.length) return
    animationOptions.set([
      { label: 'None', value: -1 },
      ...animationComponent.animations.map((clip, index) => ({ label: clip.name, value: index }))
    ])
  }, [gltfComponent?.progress, avatarRigComponent?.vrm, animationComponent?.animations])

  const onChangePlayingAnimation = (index) => {
    commitProperties(LoopAnimationComponent, {
      activeClipIndex: index
    })
    getCallback(props.entity, 'xre.play')!()
  }

  return (
    <NodeEditor
      {...props}
      name={t('editor:properties.loopAnimation.title')}
      description={t('editor:properties.loopAnimation.description')}
      Icon={LoopAnimationNodeEditor.iconComponent}
    >
      {/*<ProgressBar value={5} paused={false} totalTime={100} />*/}
      <InputGroup name="Loop Animation" label={t('editor:properties.loopAnimation.lbl-loopAnimation')}>
        <SelectInput
          key={props.entity}
          options={animationOptions.value as OptionType[]}
          value={loopAnimationComponent.value.activeClipIndex}
          onChange={onChangePlayingAnimation}
        />
      </InputGroup>
      {avatarRigComponent != null && (
        <InputGroup name="Animation Pack" label={t('editor:properties.loopAnimation.lbl-animationPack')}>
          <ModelInput
            value={loopAnimationComponent.animationPack.value}
            onRelease={commitProperty(LoopAnimationComponent, 'animationPack')}
          />
          {errors?.LOADING_ERROR && (
            <div style={{ marginTop: 2, color: '#FF8C00' }}>{t('editor:properties.model.error-url')}</div>
          )}
        </InputGroup>
      )}
      <InputGroup name="Time Scale" label={t('editor:properties.loopAnimation.lbl-timeScale')}>
        <NumericInput
          value={loopAnimationComponent.timeScale.value}
          onChange={updateProperty(LoopAnimationComponent, 'timeScale')}
          onRelease={commitProperty(LoopAnimationComponent, 'timeScale')}
        />
      </InputGroup>
      {canConvert && (
        <InputGroup name="Use VRM" label={t('editor:properties.loopAnimation.lbl-useVRM')}>
          <Checkbox
            checked={loopAnimationComponent.useVRM.value}
            onChange={commitProperty(LoopAnimationComponent, 'useVRM')}
          />
        </InputGroup>
      )}
      <InputGroup name="Paused" label={t('editor:properties.loopAnimation.lbl-paused')}>
        <Checkbox
          checked={loopAnimationComponent.paused.value}
          onChange={commitProperty(LoopAnimationComponent, 'paused')}
        />
      </InputGroup>
      <InputGroup name="Loop" label={t('editor:properties.loopAnimation.lbl-loop')}>
        <SelectInput
          options={[
            { label: 'Once', value: LoopOnce },
            { label: 'Repeat', value: LoopRepeat },
            { label: 'Ping Pong', value: LoopPingPong }
          ]}
          value={loopAnimationComponent.loop.value}
          onChange={commitProperty(LoopAnimationComponent, 'loop')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

LoopAnimationNodeEditor.iconComponent = FaStreetView

export default LoopAnimationNodeEditor
