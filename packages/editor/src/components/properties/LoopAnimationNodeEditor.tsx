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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { AnimationManager } from '@etherealengine/engine/src/avatar/AnimationManager'
import { LoopAnimationComponent } from '@etherealengine/engine/src/avatar/components/LoopAnimationComponent'
import { useComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { getCallback } from '@etherealengine/engine/src/scene/components/CallbackComponent'
import { ModelComponent } from '@etherealengine/engine/src/scene/components/ModelComponent'
import { useHookstate } from '@etherealengine/hyperflux'

import AnimationIcon from '@mui/icons-material/Animation'

import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperties, updateProperty } from './Util'

/**
 * ModelNodeEditor used to create editor view for the properties of ModelNode.
 *
 * @type {class component}
 */
export const LoopAnimationNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const entity = props.entity
  const modelComponent = useComponent(entity, ModelComponent)
  const loopAnimationComponent = useComponent(entity, LoopAnimationComponent)

  const animationOptions = useHookstate([] as { label: string; value: number }[])

  useEffect(() => {
    const obj3d = modelComponent.value.scene
    const animations = loopAnimationComponent.value.hasAvatarAnimations
      ? AnimationManager.instance._animations
      : obj3d?.animations ?? []
    animationOptions.set([
      { label: 'None', value: -1 },
      ...animations.map((clip, index) => ({ label: clip.name, value: index }))
    ])
  }, [modelComponent.scene, loopAnimationComponent.hasAvatarAnimations])

  const onChangePlayingAnimation = (index) => {
    updateProperties(LoopAnimationComponent, {
      activeClipIndex: index
    })
    getCallback(props.entity, 'xre.play')!()
  }

  return (
    <NodeEditor
      name={t('editor:properties.loopAnimation.title')}
      description={t('editor:properties.loopAnimation.description')}
      {...props}
    >
      <InputGroup name="Loop Animation" label={t('editor:properties.loopAnimation.lbl-loopAnimation')}>
        <SelectInput
          key={props.entity}
          options={animationOptions.value}
          value={loopAnimationComponent.value.activeClipIndex}
          onChange={onChangePlayingAnimation}
        />
      </InputGroup>
      <InputGroup name="Is Avatar" label={t('editor:properties.model.lbl-isAvatar')}>
        <BooleanInput
          value={loopAnimationComponent.value.hasAvatarAnimations}
          onChange={updateProperty(LoopAnimationComponent, 'hasAvatarAnimations')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

LoopAnimationNodeEditor.iconComponent = AnimationIcon

export default LoopAnimationNodeEditor
