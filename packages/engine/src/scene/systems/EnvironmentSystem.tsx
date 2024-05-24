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

import React, { useEffect } from 'react'

import {
  defineSystem,
  Entity,
  PresentationSystemGroup,
  QueryReactor,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { BackgroundComponent } from '@etherealengine/spatial/src/renderer/components/SceneComponents'
import { haveCommonAncestor } from '@etherealengine/spatial/src/transform/components/EntityTree'

import { EnvmapComponent, updateEnvMap } from '../components/EnvmapComponent'
import { EnvMapSourceType } from '../constants/EnvMapEnum'

const EnvmapReactor = (props: { backgroundEntity: Entity }) => {
  const entity = useEntityContext()
  const envmapComponent = useComponent(entity, EnvmapComponent)
  const backgroundComponent = useComponent(props.backgroundEntity, BackgroundComponent)
  const groupComponent = useComponent(entity, GroupComponent)

  useEffect(() => {
    // TODO use spatial queries
    if (!haveCommonAncestor(entity, props.backgroundEntity)) return
    if (envmapComponent.type.value !== EnvMapSourceType.Skybox) return
    for (const obj of groupComponent.value) {
      updateEnvMap(obj as any, backgroundComponent.value as any)
    }
  }, [envmapComponent.type, backgroundComponent])

  return null
}

const BackgroundReactor = () => {
  const backgroundEntity = useEntityContext()
  return <QueryReactor Components={[EnvmapComponent]} ChildEntityReactor={EnvmapReactor} props={{ backgroundEntity }} />
}

export const EnvironmentSystem = defineSystem({
  uuid: 'ee.engine.EnvironmentSystem',
  insert: { after: PresentationSystemGroup },
  reactor: () => <QueryReactor Components={[BackgroundComponent]} ChildEntityReactor={BackgroundReactor} />
})
