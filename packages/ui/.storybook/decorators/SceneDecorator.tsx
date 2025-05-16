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

import { LocationState } from '@ir-engine/client-core/src/social/services/LocationService'
import * as ECS from '@ir-engine/ecs'
import { SceneState } from '@ir-engine/engine/src/gltf/GLTFState'
import { getMutableState, getState } from '@ir-engine/hyperflux'
import { ReferenceSpaceState, TransformComponent } from '@ir-engine/spatial'
import React, { useEffect, useRef, useState } from 'react'
import { Euler, Quaternion, Vector3 } from 'three'

export default function SceneDecorator({ sceneName }: { sceneName?: string }) {
  const [activeScene, setActiveScene] = useState(sceneName)
  const unloadRef = useRef<() => void | null>(null)

  useEffect(() => {
    if (!sceneName) return

    getMutableState(LocationState).currentLocation.location.sceneId.set(1 as any)
    getMutableState(LocationState).currentLocation.location.sceneURL.set(sceneName)
    const viewerEntity = getState(ReferenceSpaceState).viewerEntity
    ECS.setComponent(viewerEntity, TransformComponent, {
      position: new Vector3(0, 2, 0),
      rotation: new Quaternion().setFromEuler(new Euler((Math.PI / 180) * 10, Math.PI, 0))
    })

    // Store the unload function in a ref
    const unload = SceneState.loadScene(sceneName as any, 1 as any, viewerEntity)
    // @ts-ignore
    unloadRef.current = unload
    setActiveScene(sceneName)

    return () => {
      if (!ECS.Engine.instance) return
      getMutableState(LocationState).currentLocation.location.sceneId.set('')
      getMutableState(LocationState).currentLocation.location.sceneURL.set('')
      unload()
    }
  }, [activeScene])

  useEffect(() => {
    if (sceneName !== activeScene) {
      unloadRef.current?.()
      setActiveScene(sceneName)
    }
  }, [sceneName])
  return <div key={sceneName} />
}
