import { Object3DComponent } from '../../scene/components/Object3DComponent'
import { AutopilotSystem } from '../systems/AutopilotSystem'
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { BaseInput } from '../../input/enums/BaseInput'
import { Raycaster } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { AutoPilotRequestComponent } from '../component/AutoPilotRequestComponent'
import { getSystem } from '../../ecs/functions/SystemFunctions'
import { Input } from '../../input/components/Input'
import { InputBehaviorType } from '../../input/interfaces/InputSchema'
import { LifecycleValue } from '../../common/enums/LifecycleValue'

export const doRaycast: InputBehaviorType = (actorEntity, inputKey, inputValue): void => {
  if (inputValue.lifecycleState !== LifecycleValue.STARTED) {
    return
  }

  const autopilotSystem = getSystem(AutopilotSystem)
  const input = getComponent(actorEntity, Input)
  const coords = input.data.get(BaseInput.SCREENXY)?.value

  const raycaster = new Raycaster()
  raycaster.setFromCamera({ x: coords[0], y: coords[1] }, Engine.camera)
  const raycasterResults = []
  const clickResult = autopilotSystem.queryResults.navmeshes.all.reduce(
    (previousEntry, currentEntity) => {
      console.log(currentEntity)
      const mesh = getComponent(currentEntity, Object3DComponent).value
      raycasterResults.length = 0
      raycaster.intersectObject(mesh, true, raycasterResults)
      if (!raycasterResults.length) {
        return previousEntry
      }

      if (raycasterResults[0].distance < previousEntry.distance) {
        return {
          distance: raycasterResults[0].distance,
          point: raycasterResults[0].point,
          entity: currentEntity
        }
      }

      return previousEntry
    },
    { distance: Infinity, point: null, entity: null }
  )
  console.log('~~~ clickResult', clickResult)

  if (clickResult.point) {
    console.log('ADD AutoPilotRequestComponent')
    addComponent(actorEntity, AutoPilotRequestComponent, {
      point: clickResult.point,
      navEntity: clickResult.entity
    })
  }
}
