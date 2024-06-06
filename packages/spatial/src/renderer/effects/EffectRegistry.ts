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
import { Entity } from '@etherealengine/ecs'
import { defineState } from '@etherealengine/hyperflux'
import { EffectComposer } from 'postprocessing'
import React from 'react'
import { Scene } from 'three'

export type EffectReactorProps = {
  isActive: boolean
  rendererEntity: Entity
  effectData: any
  effects: any
  composer: EffectComposer
  scene: Scene
}

/** Interface for dynamic effect Registry
 * @param reactor reactor for effect
 * @param defaultValues specifies the default values for the effect adhering to schema
 * @param schema specifies a schema for the editor to generate UI for each effect. (@todo Eventually can generate from default values)
 * @example
 * {
    reactor: ChromaticAberrationEffectProcessReactor,
    defaultValues: {
      hue: 1,
      saturation: 1
    },
    schema: {
      hue: { propertyType: PropertyTypes.Number, name: 'Hue', min: -1, max: 1, step: 0.01 },
      saturation: { propertyType: PropertyTypes.Number, name: 'Saturation', min: -1, max: 1, step: 0.01 }
    }
   }
 */
export interface EffectRegistryEntry {
  reactor: React.FC<EffectReactorProps>
  defaultValues: any
  schema: any
}

export const PostProcessingEffectState = defineState({
  name: 'PostProcessingEffectState',
  initial: {} as Record<string, EffectRegistryEntry>
})
