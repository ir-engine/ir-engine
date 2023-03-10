import { AvatarStates } from '../../avatar/animation/Util'
import { UndefinedEntity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const SittingComponent = defineComponent({
  name: 'SittingComponent',

  onInit(entity) {
    return {
      mountPointEntity: UndefinedEntity,
      state: null! as typeof AvatarStates[keyof typeof AvatarStates]
    }
  },

  onSet(entity, component, json) {
    if (!json) return

    if (typeof json.mountPointEntity === 'number') component.mountPointEntity.set(json.mountPointEntity)
    if (typeof json.state === 'string') component.state.set(json.state)
  }
})
