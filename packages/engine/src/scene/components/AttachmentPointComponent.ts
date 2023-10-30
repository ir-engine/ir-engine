import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const AttachmentPointComponent = defineComponent({
  name: 'EE_attachment_point',
  jsonID: 'attachment-point',

  onInit: (entity) => ({
    tags: [] as string[]
  }),
  toJSON: (entity, component) => ({
    tags: component.tags.value
  }),
  onSet: (entity, component, json) => {
    if (!json) return
    if (Array.isArray(json.tags)) component.tags.set(json.tags)
  },
  reactor: () => {
    return null
  }
})
