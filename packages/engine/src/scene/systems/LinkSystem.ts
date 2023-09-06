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

import { getState } from '@etherealengine/hyperflux'
import { SceneServices } from '../../ecs/classes/Scene'
import { defineQuery, getComponent, getOptionalComponent } from '../../ecs/functions/ComponentFunctions'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { InputComponent } from '../../input/components/InputComponent'
import { InputSourceComponent } from '../../input/components/InputSourceComponent'
import { XRStandardGamepadButton } from '../../input/state/ButtonState'
import { XRState } from '../../xr/XRState'
import { LinkComponent } from '../components/LinkComponent'
import { VisibleComponent } from '../components/VisibleComponent'

const linkQuery = defineQuery([LinkComponent, VisibleComponent, InputComponent])

const execute = () => {
  for (const entity of linkQuery()) {
    const linkComponent = getComponent(entity, LinkComponent)
    const inputComponent = getComponent(entity, InputComponent)
    const inputSourceEntity = inputComponent?.inputSources[0]

    if (inputSourceEntity) {
      const inputSource = getOptionalComponent(inputSourceEntity, InputSourceComponent)
      const buttons = inputSource?.buttons

      if (buttons)
        if (buttons.PrimaryClick?.touched) {
          if (buttons.PrimaryClick.up) {
            if (!linkComponent.sceneNav) {
              typeof window === 'object' && window && window.open(linkComponent.url, '_blank')
            } else {
              SceneServices.setCurrentScene(linkComponent.projectName, linkComponent.sceneName)
            }
          }
        } else if (buttons[XRStandardGamepadButton.Trigger]?.down) {
          const xrState = getState(XRState)
          if (!linkComponent.sceneNav) {
            linkComponent.sceneNav && xrState.session?.end()
            typeof window === 'object' && window && window.open(linkComponent.url, '_blank')
          } else {
            SceneServices.setCurrentScene(linkComponent.projectName, linkComponent.sceneName)
          }
        }
    }
  }
}

export const LinkSystem = defineSystem({
  uuid: 'ee.engine.LinkSystem',
  execute
})
