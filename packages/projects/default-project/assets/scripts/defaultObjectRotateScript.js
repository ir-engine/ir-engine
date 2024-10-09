




import { defineSystem  } from  "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/SystemFunctions.ts" 
import { defineQuery } from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/QueryFunctions.tsx"
import { getState} from  "https://localhost:3000/@fs/root/ir-engine/packages/hyperflux/src/functions/StateFunctions.ts"
import { setComponent  , getComponent} from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/ComponentFunctions.ts"
import { AnimationSystemGroup } from 'https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/SystemGroups.ts'
import { ModelComponent } from "https://localhost:3000/@fs/root/ir-engine/packages/engine/src/scene/components/ModelComponent.tsx"
import { VisibleComponent } from 'https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/renderer/components/VisibleComponent.ts'
import { TransformComponent  } from "https://localhost:3000/@fs/root/ir-engine/packages/spatial/src/transform/components/TransformComponent.ts"
import { ECSState} from "https://localhost:3000/@fs/root/ir-engine/packages/ecs/src/ECSState.ts"
import { Vector3 , Quaternion} from "https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js";



const models = defineQuery([ModelComponent , VisibleComponent])

const rotationSpeed = 0.1 

const execute = () => {
  for (const model of models()) {
    const delta = getState(ECSState).deltaSeconds
    const rotationQuaternion = new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), delta * rotationSpeed)
    const transform = getComponent(model , TransformComponent)
    const currentRotation = transform.rotation || new Quaternion() 
    const newRotation = currentRotation.multiply(rotationQuaternion)
    setComponent(model, TransformComponent, { rotation: newRotation })
  }
}

export const scriptObjectRotateSystem = defineSystem({
  uuid: 'ee.editor.scriptObjectRotateSystem',
  insert: { before: AnimationSystemGroup },
  execute
})