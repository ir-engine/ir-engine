import { defineComponent, S } from '@ir-engine/ecs'
import { Bone } from 'three'

export const NormalizedBoneComponent = defineComponent({
  name: 'NormalizedBoneComponent',

  schema: S.Required(S.Type<Bone>()),

  onSet: (entity, component, mesh: Bone) => {
    component.set(mesh)
  }
})
