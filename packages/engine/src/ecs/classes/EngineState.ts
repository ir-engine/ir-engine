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

import { defineAction, defineState } from '@etherealengine/hyperflux'

import { BoxGeometry, Group, Mesh, MeshNormalMaterial, Scene, Vector3 } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { matches } from '../../common/functions/MatchesUtils'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { NameComponent } from '../../scene/components/NameComponent'
import { VisibleComponent } from '../../scene/components/VisibleComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { setObjectLayers } from '../../scene/functions/ObjectLayers'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { getComponent, setComponent } from '../functions/ComponentFunctions'
import { createEntity } from '../functions/EntityFunctions'
import { EntityTreeComponent } from '../functions/EntityTree'

// TODO: #6016 Refactor EngineState into multiple state objects: timer, scene, world, xr, etc.
export const EngineState = defineState({
  name: 'EngineState',
  initial: () => {
    const scene = new Scene()
    scene.matrixAutoUpdate = false
    scene.matrixWorldAutoUpdate = false
    scene.layers.set(ObjectLayers.Scene)

    const originEntity = createEntity()
    const origin = new Group()
    setComponent(originEntity, NameComponent, 'origin')
    setComponent(originEntity, EntityTreeComponent, { parentEntity: null })
    setComponent(originEntity, TransformComponent)
    setComponent(originEntity, VisibleComponent, true)
    addObjectToGroup(originEntity, origin)
    origin.name = 'world-origin'
    const originHelperMesh = new Mesh(new BoxGeometry(0.1, 0.1, 0.1), new MeshNormalMaterial())
    setObjectLayers(originHelperMesh, ObjectLayers.Gizmos)
    originHelperMesh.frustumCulled = false
    origin.add(originHelperMesh)

    const cameraEntity = createEntity()
    setComponent(cameraEntity, NameComponent, 'camera')
    setComponent(cameraEntity, CameraComponent)
    setComponent(cameraEntity, VisibleComponent, true)
    setComponent(originEntity, TransformComponent, { position: new Vector3(0, 5, 2) })
    setComponent(cameraEntity, EntityTreeComponent, { parentEntity: null })
    const camera = getComponent(cameraEntity, CameraComponent)
    camera.matrixAutoUpdate = false
    camera.matrixWorldAutoUpdate = false

    return {
      simulationTimestep: 1000 / 60,

      frameTime: Date.now(),
      simulationTime: Date.now(),

      userReady: false,

      deltaSeconds: 0,
      elapsedSeconds: 0,

      physicsSubsteps: 1,

      sceneLoading: false,
      sceneLoaded: false,
      loadingProgress: 0,
      spectating: false,
      avatarLoadingEffect: false,

      /**
       * Reference to the three.js scene object.
       */
      scene,

      /**
       * The xr origin reference space entity
       */
      originEntity,

      /**
       * The xr origin group
       */
      origin,

      /**
       * The camera entity
       */
      cameraEntity,

      /**
       * An empty share link will default to the current URL, plus any modifiers (such as spectate mode)
       */
      publicPath: '',
      isBot: false,
      /** @deprecated use isEditing instead */
      isEditor: false,
      isEditing: false
    }
  }
})

export class EngineActions {
  /** @deprecated */
  static sceneLoaded = defineAction({
    type: 'ee.engine.Engine.SCENE_LOADED' as const
  })

  static spectateUser = defineAction({
    type: 'ee.engine.Engine.SPECTATE_USER' as const,
    user: matches.string.optional()
  })

  static exitSpectate = defineAction({
    type: 'ee.engine.Engine.EXIT_SPECTATE' as const
  })

  static notification = defineAction({
    type: 'ee.engine.Engine.ERROR' as const,
    text: matches.string,
    variant: matches.literals('default', 'error', 'success', 'warning', 'info') // from notistack
    /** @todo add more action types in NotificationService */
    // actionType: matches.literal('default')
  })
}
