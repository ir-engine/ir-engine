import { defineComponent } from '@etherealengine/ecs'

export const VirtualCameraComponent = defineComponent({
  name: 'VirtualCameraComponent',
  jsonID: 'EE_virtualCamera',
  onInit: (entity) => {
    return {
      fov: 60,
      near: 0.1,
      far: 1000
    }
  },
  toJSON: (entity, component) => {
    return {
      fov: component.fov.value,
      near: component.near.value,
      far: component.far.value
    }
  },
  onSet: (entity, component, json) => {
    if (!json) return
    if (typeof json.fov === 'number') component.fov.set(json.fov)
    if (typeof json.near === 'number') component.near.set(json.near)
    if (typeof json.far === 'number') component.far.set(json.far)
  }
})
