import { AframeComponentOptions, AframeComponetInterface } from '../aframe-component'

export interface CursorComponentOptions extends AframeComponentOptions {
  downEvents: Array<string>, // additional events on the entity to listen to for triggering mousedown
  fuse: boolean, // Whether cursor is fuse-based.
  fuseTimeout: number, // How long to wait (in milliseconds) before triggering a fuse-based click event.
  mouseCursorStylesEnabled: boolean, // Whether to show pointer cursor in rayOrigin: mouse mode when hovering over entity.
  rayOrigin: string, // Where the intersection ray is cast from (i.e.,entity or mouse). rayOrigin: mouse is extremely useful for VR development on a mouse and keyboard.
  upEvents: Array<string> // additional events on the entity to listen to for triggering mouseup
}

export const defaultCursorComponentOptions: CursorComponentOptions = {
  downEvents: [],
  fuse: false,
  fuseTimeout: 1500,
  mouseCursorStylesEnabled: true,
  rayOrigin: 'entity',
  upEvents: []
}

export default class Cursor implements AframeComponetInterface {
  name = 'cursor'
  options?: Partial<CursorComponentOptions>

  constructor(options: Partial<CursorComponentOptions> = defaultCursorComponentOptions) {
    this.options = options
  }
}
