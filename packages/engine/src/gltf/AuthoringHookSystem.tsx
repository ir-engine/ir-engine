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
