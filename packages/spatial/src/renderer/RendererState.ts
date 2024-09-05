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

import { Entity } from '@ir-engine/ecs/src/Entity'
import { defineState, syncStateWithLocalStorage } from '@ir-engine/hyperflux'

import { isIPhone } from '../common/functions/isMobile'
import { RenderModes, RenderModesType } from './constants/RenderModes'

export const RendererState = defineState({
  name: 'RendererState',
  initial: () => ({
    qualityLevel: isIPhone ? 2 : 5, // range from 0 to 5
    automatic: isIPhone ? false : true,
    // usePBR: true,
    usePostProcessing: isIPhone ? false : true,
    useShadows: isIPhone ? false : true,
    /** Resoulion scale. **Default** value is 1. */
    renderScale: 1,
    physicsDebug: false,
    bvhDebug: false,
    avatarDebug: false,
    renderMode: RenderModes.SHADOW as RenderModesType,
    nodeHelperVisibility: false,
    gridVisibility: false,
    gridHeight: 0,
    forceBasicMaterials: false,
    shadowMapResolution: isIPhone ? 256 : 2048,
    infiniteGridHelperEntity: null as Entity | null
  }),
  extension: syncStateWithLocalStorage([
    'qualityLevel',
    'automatic',
    // 'usePBR',
    'usePostProcessing',
    'useShadows',
    'physicsDebug',
    'bvhDebug',
    'avatarDebug',
    'renderMode',
    'nodeHelperVisibility',
    'gridVisibility',
    'gridHeight'
  ])
})
