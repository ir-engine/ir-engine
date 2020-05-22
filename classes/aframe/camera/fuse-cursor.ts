import AFRAME from 'aframe'
import CursorComponent from './cursor-component'
import RaycasterComponent from './raycaster-component'
import { setComponent } from '../aframe-component'

export default class FuseCursor {
  el: AFRAME.Entity | null = null

  constructor() {
    this.setupFuseCursor()
  }

  setupFuseCursor(): void {
    this.el = document.createElement('a-entity')
    this.el.classList.add('cursor')

    const cursor = new CursorComponent({ fuse: true, fuseTimeout: defaultFuseDuration })
    setComponent(this.el, cursor)
    const raycaster = new RaycasterComponent({ far: 20, interval: 1000, objects: '.clickable' })
    setComponent(this.el, raycaster)

    this.el.setAttribute('geometry', { primitive: 'ring', radiusInner: 0.02, radiusOuter: 0.03 })
    this.el.setAttribute('material', {
      color: 'white',
      shader: 'standard',
      transparent: true,
      opacity: 0.2
    })

    this.el.setAttribute('animation__click', {
      property: 'scale',
      startEvents: 'click',
      easing: 'easeInCubic',
      dur: 150,
      from: '0.1 0.1 0.1',
      to: '1 1 1'
    })

    this.el.setAttribute('animation__fusing', {
      property: 'scale',
      startEvents: 'fusing',
      easing: 'easeInCubic',
      dur: defaultFuseDuration,
      from: '1 1 1',
      to: '0.1 0.1 0.1'
    })

    this.el.setAttribute('animation__mouseleave', {
      property: 'scale',
      startEvents: 'mouseleave',
      easing: 'easeInCubic',
      dur: 500,
      to: '1 1 1'
    })
  }
}

const defaultFuseDuration = 6 * 1000
