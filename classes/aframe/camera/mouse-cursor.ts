import AFRAME from 'aframe'
import CursorComponent from './cursor-component'
import RaycasterComponent from './raycaster-component'
import { setComponent } from '../aframe-component'

export default class MouseCursor {
  el: AFRAME.Entity | null = null

  constructor(public cursorObjects: string[] = ['.clickable']) {
    this.setupMouseCursor()
  }

  setupMouseCursor(): void {
    this.el = document.createElement('a-entity')
    this.el.classList.add('cursor')

    const cursor = new CursorComponent({ rayOrigin: 'mouse' })
    setComponent(this.el, cursor)
    const raycaster = new RaycasterComponent({ far: 20, interval: 1000, objects: this.cursorObjects.join(',') })
    setComponent(this.el, raycaster)
  }
}
