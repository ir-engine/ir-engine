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

import { useEffect } from 'react'
import { Entity, UndefinedEntity } from '../../ecs/classes/Entity'
import {
  defineComponent,
  hasComponent,
  setComponent,
  useComponent,
  useOptionalComponent
} from '../../ecs/functions/ComponentFunctions'
import { createEntity, useEntityContext } from '../../ecs/functions/EntityFunctions'
import { LocalTransformComponent, TransformComponent } from '../../transform/components/TransformComponent'
import { VisibleComponent } from './VisibleComponent'
import { VolumetricComponent } from './VolumetricComponent'

export const FashionDesignComponent = defineComponent({
  name: 'EE_fashion',
  jsonID: 'fashion',

  onInit: (entity) => {
    return {
      performerEntity: UndefinedEntity,
      outfitEntity: UndefinedEntity,
      performerPath: 'https://localhost:8642/projects/default-project/rai.json',
      outfitPath: 'https://localhost:8642/projects/default-project/rai-outfit.json'
    }
  },

  toJSON: (entity, component) => ({
    performerPath: component.performerPath.value,
    outfitPath: component.outfitPath.value
  }),

  onSet: (entity, component, json) => {
    if (!json) return
    if (json.performerPath) {
      component.performerPath.set(json.performerPath)
    }
    if (json.outfitPath) {
      component.outfitPath.set(json.outfitPath)
    }
  },

  reactor: FashionDesignReactor
})

function FashionDesignReactor() {
  const entity = useEntityContext()
  const fashion = useComponent(entity, FashionDesignComponent)
  const performer = useOptionalComponent(entity, VolumetricComponent)
  const outfit = useOptionalComponent(fashion.outfitEntity.value, VolumetricComponent)

  console.log('DBGG fashion design reactor', performer, outfit)

  const setupVolumetricEntity = (_entity: Entity, path: string) => {
    setComponent(_entity, VolumetricComponent, {
      paths: [path],
      autoplay: false
    })
    if (!hasComponent(_entity, VisibleComponent)) {
      setComponent(_entity, VisibleComponent)
    }

    if (!hasComponent(_entity, TransformComponent)) {
      setComponent(_entity, TransformComponent)
    }
    if (!hasComponent(_entity, LocalTransformComponent)) {
      setComponent(_entity, LocalTransformComponent)
    }
    return _entity
  }

  useEffect(() => {
    console.log('DBGG fashion design component init')

    if (!fashion.performerEntity.value) {
      setupVolumetricEntity(entity, fashion.performerPath.value)
    }

    if (!fashion.outfitEntity.value) {
      const outfitEntity = createEntity()
      fashion.outfitEntity.set(outfitEntity)
      setupVolumetricEntity(outfitEntity, fashion.outfitPath.value)
    }
  }, [])

  useEffect(() => {
    if (!fashion.performerPath.value || !fashion.outfitPath.value) return
    if (!performer || !outfit) return
    performer.paths.set([fashion.performerPath.value])
    outfit.paths.set([fashion.outfitPath.value])
  }, [fashion.performerPath, fashion.outfitPath])

  useEffect(() => {
    if (!performer || !outfit) return
    if (!performer.initialBuffersLoaded || !outfit.initialBuffersLoaded) return
    performer.paused.set(false)
    outfit.paused.set(false)
  }, [performer?.initialBuffersLoaded, outfit?.initialBuffersLoaded])

  return null
}
