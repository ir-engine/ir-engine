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

import config from '@etherealengine/common/src/config'
import { getMutableState, getState } from '@etherealengine/hyperflux'
import { useEffect } from 'react'
import { AmbientLight, Vector3 } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { teleportAvatar } from '../../avatar/functions/moveAvatar'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { ObjectDirection } from '../../common/constants/Axis3D'
import { Engine } from '../../ecs/classes/Engine'
import { EngineState } from '../../ecs/classes/EngineState'
import { UndefinedEntity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  getComponent,
  getMutableComponent,
  removeComponent,
  setComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, removeEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent } from '../../ecs/functions/EntityTree'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { SceneLoadingSystem } from '../SceneModule'
import { PortalEffect } from '../classes/PortalEffect'
import { ObjectLayers } from '../constants/ObjectLayers'
import { setObjectLayers } from '../functions/setObjectLayers'
import { GroupComponent, addObjectToGroup } from './GroupComponent'
import { PortalComponent, PortalEffects, PortalState } from './PortalComponent'
import { VisibleComponent } from './VisibleComponent'

export const HyperspacePortalEffect = 'Hyperspace'

export const HyperspaceTagComponent = defineComponent({
  name: 'HyperspaceTagComponent',

  onInit(entity) {
    const hyperspaceEffectEntity = createEntity()
    const hyperspaceEffect = new PortalEffect()
    addObjectToGroup(hyperspaceEffectEntity, hyperspaceEffect)
    setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)

    AssetLoader.loadAsync(`${config.client.fileServer}/projects/default-project/assets/galaxyTexture.jpg`).then(
      (texture) => {
        hyperspaceEffect.texture = texture
      }
    )

    getComponent(hyperspaceEffectEntity, TransformComponent).scale.set(10, 10, 10)
    setComponent(hyperspaceEffectEntity, EntityTreeComponent, { parentEntity: entity })
    setComponent(hyperspaceEffectEntity, VisibleComponent)

    const ambientLightEntity = createEntity()
    const light = new AmbientLight('#aaa')
    setObjectLayers(hyperspaceEffect, ObjectLayers.Portal)
    light.layers.enable(ObjectLayers.Portal)
    addObjectToGroup(ambientLightEntity, light)

    setComponent(ambientLightEntity, EntityTreeComponent, { parentEntity: hyperspaceEffectEntity })
    setComponent(ambientLightEntity, VisibleComponent)

    return {
      // all internals
      sceneVisible: true,
      transition: createTransitionState(0.5, 'OUT'),
      hyperspaceEffectEntity,
      ambientLightEntity
    }
  },

  onRemove(entity, component) {
    removeEntity(component.ambientLightEntity.value)
    removeEntity(component.hyperspaceEffectEntity.value)
  },

  reactor: () => {
    const entity = useEntityContext()
    const { transition, hyperspaceEffectEntity } = getComponent(entity, HyperspaceTagComponent)
    const hyperspaceEffect = getComponent(hyperspaceEffectEntity, GroupComponent)[0] as any as PortalEffect
    const cameraTransform = getComponent(Engine.instance.cameraEntity, TransformComponent)
    const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)

    useEffect(() => {
      // TODO: add BPCEM of old and new scenes and fade them in and out too
      transition.setState('IN')

      camera.layers.enable(ObjectLayers.Portal)

      camera.zoom = 1.5

      hyperspaceEffect.quaternion.setFromUnitVectors(
        ObjectDirection.Forward,
        new Vector3(0, 0, 1).applyQuaternion(cameraTransform.rotation).setY(0).normalize()
      )
    }, [])

    useExecute(
      () => {
        const engineState = getState(EngineState)
        const sceneLoaded = engineState.sceneLoaded

        if (sceneLoaded && transition.alpha >= 1 && transition.state === 'IN') {
          transition.setState('OUT')
          camera.layers.enable(ObjectLayers.Scene)
        }

        transition.update(engineState.deltaSeconds, (opacity) => {
          hyperspaceEffect.update(engineState.deltaSeconds)
          hyperspaceEffect.tubeMaterial.opacity = opacity
        })

        const sceneVisible = getMutableComponent(entity, HyperspaceTagComponent).sceneVisible

        if (transition.state === 'IN' && transition.alpha >= 1 && sceneVisible.value) {
          /**
           * hide scene, render just the hyperspace effect and avatar
           */
          getMutableState(PortalState).portalReady.set(true)
          const activePortal = getComponent(getState(PortalState).activePortalEntity, PortalComponent)
          // teleport player to where the portal spawn position is
          teleportAvatar(Engine.instance.localClientEntity, activePortal!.remoteSpawnPosition, true)
          camera.layers.disable(ObjectLayers.Scene)
          sceneVisible.set(false)
        }

        if (sceneLoaded && transition.state === 'OUT' && transition.alpha <= 0 && !sceneVisible.value) {
          sceneVisible.set(true)
          removeComponent(entity, HyperspaceTagComponent)
          getMutableState(PortalState).activePortalEntity.set(UndefinedEntity)
          getMutableState(PortalState).portalReady.set(false)
          camera.layers.disable(ObjectLayers.Portal)
          return
        }

        getComponent(hyperspaceEffectEntity, TransformComponent).position.copy(cameraTransform.position)

        if (camera.zoom > 0.75) {
          camera.zoom -= engineState.deltaSeconds
          camera.updateProjectionMatrix()
        }
      },
      { with: SceneLoadingSystem }
    )

    return null
  }
})

PortalEffects.set(HyperspacePortalEffect, HyperspaceTagComponent)
