import { matches } from '../../common/functions/MatchesUtils'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const TargetCameraRotationComponent = defineComponent({
  name: 'TargetCameraRotationComponent',

  onInit(entity) {
    return {
      /** Rotation around Z axis */
      phi: 0,
      phiVelocity: { value: 0 },
      /** Rotation around Y axis */
      theta: 0,
      thetaVelocity: { value: 0 },
      /** Time to reach the target */
      time: 0
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.theta)) component.theta.set(json.theta)
    if (matches.number.test(json.phi)) component.phi.set(json.phi)
    if (matches.number.test(json.time)) component.time.set(json.time)
  }
})
