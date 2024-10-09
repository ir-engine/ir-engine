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




import { defineSystem  } from  "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/SystemFunctions.ts" 
import { defineQuery } from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/QueryFunctions.tsx"
import { getState} from  "https://localhost:3000/@fs/root/ir-engine/packages/hyperflux/src/functions/StateFunctions.ts"
import { setComponent  , getComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/ComponentFunctions.ts"
import { AnimationSystemGroup } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/SystemGroups.ts'
import { SkyboxComponent } from "https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/SkyboxComponent.ts"
import { ECSState} from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/ECSState.ts"
import {SkyTypeEnum} from 'https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/constants/SkyTypeEnum.ts'

const skyboxs = defineQuery([SkyboxComponent ])

setComponent(skyboxs()[0], SkyboxComponent , {backgroundType: SkyTypeEnum.skybox})

const execute = () => {
  for (const skybox of skyboxs()) {
    const value = (getState(ECSState).elapsedSeconds  % 24 ) / 24 
    const props =   getComponent(skybox , SkyboxComponent).skyboxProps
    setComponent(skybox , SkyboxComponent, {skyboxProps : {...props , azimuth : value} })
  }
}




export const scriptDayNightCycleSystem = defineSystem({
  uuid: 'ee.editor.scriptDayNightCycleSystem',
  insert: { before : AnimationSystemGroup },
  execute
  })