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

import { EntityUUID, UndefinedEntity } from '@etherealengine/ecs'
import { defineComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { NO_PROXY } from '@etherealengine/hyperflux'
import matches from 'ts-matches'

enum XRUIVisibilityOverride {
  none = 0,
  on = 1,
  off = 2
}
enum XRUIActivationType {
  proximity = 0,
  hover = 1
}
export const InteractableComponent = defineComponent({
  name: 'InteractableComponent',
  jsonID: 'EE_interactable',
  onInit: () => {
    return {
      //TODO make clickInteract work, base it off of MediaControls clicking...refactor mediacontrols, separate mediacontrols from interactables
      //TODO after that is done, get rid of custom updates and add a state bool for "interactable" or "showUI"...think about best name
      uiEntity: UndefinedEntity,
      label: null as string | null,
      uiVisibilityOverride: XRUIVisibilityOverride.none,
      uiActivationType: XRUIActivationType.proximity,
      activationDistance: 2,
      clickInteract: false,
      callbacks: [] as Array<{
        /**
         * The function to call on the CallbackComponent of the targetEntity when the trigger volume is entered.
         */
        callbackID: null | string
        /**
         * empty string represents self
         */
        target: null | EntityUUID
      }>
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.label) component.label.set(json.label)
    if (typeof json.uiActivationType === 'number' && component.uiActivationType.value !== json.uiActivationType)
      component.uiActivationType.set(json.uiActivationType)
    if (typeof json.clickInteract === 'boolean' && component.clickInteract.value !== json.clickInteract)
      component.clickInteract.set(json.clickInteract)
    if (json.activationDistance) component.activationDistance.set(json.activationDistance)
    if (
      matches
        .arrayOf(
          matches.shape({
            callbackID: matches.nill.orParser(matches.string),
            target: matches.nill.orParser(matches.string)
          })
        )
        .test(json.callbacks)
    ) {
      component.callbacks.set(json.callbacks)
    }
  },

  toJSON: (entity, component) => {
    return {
      label: component.label.value,
      clickInteract: component.clickInteract.value,
      activationDistance: component.activationDistance.value,
      uiActivationType: component.uiActivationType.value,
      callbacks: component.callbacks.get(NO_PROXY)
    }
  }
})
