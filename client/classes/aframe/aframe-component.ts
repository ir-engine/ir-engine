import AFRAME from 'aframe'

export interface AframeComponentOptions {
}

export interface AframeComponentInterface {
  name: string,
  options?: AframeComponentOptions
}

export function setComponent (el: AFRAME.Entity, component: AframeComponentInterface): void {
  el.setAttribute(component.name, component.options)
}

export function setupControlsHandler (el: AFRAME.Entity, components: AframeComponentInterface[]): void {
  components.forEach(component => setComponent(el, component))
}
