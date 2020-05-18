import AFRAME from 'aframe'

export interface AframeComponentOptions {
}

export interface AframeComponetInterface {
  name: string,
  options?: AframeComponentOptions
}

export function setComponent (el: AFRAME.Entity, component: AframeComponetInterface): void {
  el.setAttribute(component.name, component.options)
}

export function setupControlsHandler (el: AFRAME.Entity, components: AframeComponetInterface[]): void {
  components.forEach(component => setComponent(el, component))
}
