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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { LayoutData } from 'rc-dock'

import { NotificationService } from '@ir-engine/client-core/src/common/services/NotificationService'
import { UUIDComponent } from '@ir-engine/ecs'
import { Entity, UndefinedEntity } from '@ir-engine/ecs/src/Entity'
import { GLTFComponent } from '@ir-engine/engine/src/gltf/GLTFComponent'
import { AssetModifiedState } from '@ir-engine/engine/src/gltf/GLTFState'
import { LinkState } from '@ir-engine/engine/src/scene/components/LinkComponent'

import { defineState, getMutableState, getState, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { useEffect } from 'react'

export enum UIMode {
  BASIC = 'BASIC',
  ADVANCED = 'ADVANCED'
}

export type activeLowerPanel = 'properties' | 'inspector'

export const EditorState = defineState({
  name: 'EditorState',
  initial: () => ({
    projectName: null as string | null,
    sceneName: null as string | null,
    /** the url of the current scene file */
    scenePath: null as string | null,
    /** just used to store the id of the current scene asset */
    sceneAssetID: null as string | null,
    panelLayout: {} as LayoutData,
    rootEntity: UndefinedEntity,
    uiEnabled: true,
    uiMode: UIMode.ADVANCED,
    canvasRef: null as React.RefObject<HTMLElement> | null,
    activeLowerPanel: 'properties' as activeLowerPanel
  }),
  setActiveLowerPanel: (panel: activeLowerPanel) => {
    getMutableState(EditorState).activeLowerPanel.set(panel)
  },
  useIsModified: () => {
    const rootEntity = useHookstate(getMutableState(EditorState).rootEntity).value
    const modifiedState = useMutableState(AssetModifiedState)
    if (!rootEntity) return false
    return !!modifiedState[GLTFComponent.getSourceID(rootEntity)].value
  },
  isModified: () => {
    const rootEntity = getState(EditorState).rootEntity
    if (!rootEntity) return false
    return !!getState(AssetModifiedState)[GLTFComponent.getSourceID(rootEntity)]
  },
  markModifiedScene: (entity: Entity) => {
    const sourceID = GLTFComponent.getSourceID(entity)
    if (!sourceID) return

    const modifiedState = getMutableState(AssetModifiedState)
    modifiedState[sourceID].set(true)
    const activeScene = getState(EditorState).rootEntity
    //also mark the active scene as modified due to scene deltas being added
    const rootSourceID = GLTFComponent.getSourceID(activeScene)
    if (rootSourceID !== sourceID) {
      modifiedState[rootSourceID].set(true)
    }
  },
  isInActiveScene: (entity: Entity) => {
    const rootEntity = getState(EditorState).rootEntity
    const sourceEntity = UUIDComponent.getSourceEntity(entity)
    return sourceEntity === rootEntity
  },
  reactor: () => {
    const linkState = useMutableState(LinkState)

    useEffect(() => {
      if (!linkState.location.value) return

      NotificationService.dispatchNotify('Scene navigation is disabled in the studio', { variant: 'warning' })
      linkState.location.set(undefined)
    }, [linkState.location])

    return null
  }
})
