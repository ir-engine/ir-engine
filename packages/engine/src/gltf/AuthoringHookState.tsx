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

import { EntityUUID, UUIDComponent } from '@etherealengine/ecs'
import { NO_PROXY, defineState, getMutableState, useState } from '@etherealengine/hyperflux'
import React, { useEffect } from 'react'
import { generateUUID } from 'three/src/math/MathUtils'
import { GLTFDocumentState } from './GLTFDocumentState'

export type AuthoringHook = {
  entityUUID: EntityUUID
  sceneID: string
  callback: (entityUUID: EntityUUID) => void
}

type AuthoringHookJob = AuthoringHook & { hookID: string }

export function addAuthoringHook(hook: AuthoringHook): string {
  const hookID = generateUUID()
  getMutableState(AuthoringHookState).merge([{ ...hook, hookID }])
  return hookID
}

export const AuthoringHookState = defineState({
  name: 'AuthoringHookState',
  initial: [] as AuthoringHookJob[],
  reactor: () => {
    const hooks = useState(getMutableState(AuthoringHookState))
    return (
      <>
        {hooks.get(NO_PROXY).map((hook) => (
          <HookReactor key={hook.hookID} {...hook} />
        ))}
      </>
    )
  }
})

const HookReactor = (props: AuthoringHookJob) => {
  const { entityUUID, sceneID, callback } = props
  const authoringHooks = getMutableState(AuthoringHookState)
  const gltfDocument = useState(getMutableState(GLTFDocumentState))[sceneID]
  if (!gltfDocument.value) return null
  useEffect(() => {
    const entity = gltfDocument.value.nodes!.find((node) => node.extensions![UUIDComponent.jsonID] === entityUUID)
    if (entity) {
      callback(entityUUID)
      authoringHooks.set(authoringHooks.value.filter((hook) => hook.hookID !== props.hookID))
    }
  }, [gltfDocument])
  return null
}
