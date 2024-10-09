

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